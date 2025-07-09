import { NextResponse } from 'next/server';
import { getJarInfo, downloadJar } from '@/lib/jar-api';
import { createHash } from 'crypto';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string; pluginName: string }> }
) {
  try {
    const { userId, pluginName } = await params;

    if (!userId || !pluginName) {
      return NextResponse.json(
        { error: 'userId and pluginName are required' },
        { status: 400 }
      );
    }

    console.log('🔍 Performing JAR integrity check using external API:', { userId, pluginName });

    // Get JAR info from external API
    const jarInfo = await getJarInfo(userId, pluginName);

    if (!jarInfo.available) {
      return NextResponse.json({
        available: false,
        error: 'JAR file not available from external API'
      }, { status: 404 });
    }

    // Download JAR file from external API
    const jarBlob = await downloadJar(userId, pluginName);
    const jarBuffer = Buffer.from(await jarBlob.arrayBuffer());

    // Comprehensive integrity checks
    const checks = {
      bufferType: Buffer.isBuffer(jarBuffer),
      bufferSize: jarBuffer.length,
      isEmpty: jarBuffer.length === 0,
      hasZipSignature: false,
      checksum: '',
      zipSignatureBytes: '',
      filename: jarInfo.fileName,
      fileSize: jarInfo.fileSize,
      contentType: 'application/java-archive'
    };

    // Calculate checksum
    checks.checksum = createHash('sha256').update(jarBuffer).digest('hex');

    // Check ZIP/JAR signature (should start with 'PK')
    if (jarBuffer.length >= 2) {
      const zipSignature = jarBuffer.subarray(0, 2);
      checks.hasZipSignature = zipSignature[0] === 0x50 && zipSignature[1] === 0x4B;
      checks.zipSignatureBytes = `${zipSignature[0].toString(16).padStart(2, '0')}${zipSignature[1].toString(16).padStart(2, '0')}`;
    }

    // Check for common corruption patterns
    const corruptionIndicators = [];
    
    if (!checks.bufferType) {
      corruptionIndicators.push('Buffer type is invalid');
    }
    
    if (checks.isEmpty) {
      corruptionIndicators.push('Buffer is empty');
    }
    
    if (!checks.hasZipSignature) {
      corruptionIndicators.push(`Invalid ZIP signature: ${checks.zipSignatureBytes} (expected: 504b)`);
    }
    
    if (checks.bufferSize !== checks.fileSize) {
      corruptionIndicators.push(`Size mismatch: buffer=${checks.bufferSize}, stored=${checks.fileSize}`);
    }

    // Check if buffer contains null bytes at the beginning (corruption indicator)
    if (jarBuffer.length > 0 && jarBuffer[0] === 0) {
      corruptionIndicators.push('Buffer starts with null byte');
    }

    // Look for common text corruption patterns
    const bufferStart = jarBuffer.subarray(0, Math.min(100, jarBuffer.length)).toString('latin1');
    if (bufferStart.includes('undefined') || bufferStart.includes('null') || bufferStart.includes('[object')) {
      corruptionIndicators.push('Text corruption detected in binary data');
    }

    const integrity = {
      isValid: corruptionIndicators.length === 0,
      corruptionIndicators,
      checks,
      summary: {
        userId,
        pluginName,
        status: corruptionIndicators.length === 0 ? '✅ Valid' : '❌ Corrupted',
        issues: corruptionIndicators.length
      }
    };

    console.log('🔍 JAR integrity check results:', integrity.summary);

    return NextResponse.json(integrity);

  } catch (error) {
    console.error('❌ Error checking JAR integrity:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check JAR integrity',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
