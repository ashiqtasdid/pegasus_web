# Plugin Files API Testing Guide

## Overview

This guide provides various methods to test the Plugin Files API endpoint (`POST /plugin/files`) that retrieves all files from a user's plugin in Monaco Editor-compatible format.

## API Endpoint Details

**Endpoint:** `POST /plugin/files`  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "userId": "string",
  "pluginName": "string"
}
```

**Success Response:**
```json
{
  "success": true,
  "files": {
    "path/to/file.java": "file content here",
    "path/to/another/file.xml": "xml content here"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Testing Methods

### 1. Web Browser Testing

**Quick Test via Monaco Editor Demo:**
- Navigate to: `http://localhost:3000/editor.html`
- Enter User ID: `684f19962ac039c3142b1172`
- Enter Plugin Name: `SayHiOnJoin`
- Click "Load Plugin Files"
- View files in the integrated Monaco Editor

### 2. Command Line Testing

#### Using cURL (Cross-platform)

**Basic Test:**
```bash
curl -X POST http://localhost:3000/plugin/files \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "684f19962ac039c3142b1172",
    "pluginName": "SayHiOnJoin"
  }'
```

**Pretty-printed JSON Response:**
```bash
curl -X POST http://localhost:3000/plugin/files \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "684f19962ac039c3142b1172",
    "pluginName": "SayHiOnJoin"
  }' | jq '.'
```

**Extract File List Only:**
```bash
curl -s -X POST http://localhost:3000/plugin/files \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "684f19962ac039c3142b1172",
    "pluginName": "SayHiOnJoin"
  }' | jq -r '.files | keys[]'
```

#### Using PowerShell (Windows)

**Basic Test:**
```powershell
$requestBody = @{
    userId = "684f19962ac039c3142b1172"
    pluginName = "SayHiOnJoin"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/plugin/files" -Method POST -Body $requestBody -ContentType "application/json"

# Display response
$response | ConvertTo-Json -Depth 10
```

**Check Success and List Files:**
```powershell
$requestBody = @{
    userId = "684f19962ac039c3142b1172"
    pluginName = "SayHiOnJoin"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/plugin/files" -Method POST -Body $requestBody -ContentType "application/json"

if ($response.success) {
    Write-Host "✅ Success! Retrieved $($response.files.PSObject.Properties.Count) files" -ForegroundColor Green
    Write-Host "📋 File list:" -ForegroundColor Blue
    $response.files.PSObject.Properties | ForEach-Object {
        Write-Host "  📄 $($_.Name)" -ForegroundColor White
    }
} else {
    Write-Host "❌ Error: $($response.error)" -ForegroundColor Red
}
```

### 3. JavaScript/Node.js Testing

#### Using Node.js with fetch (Node 18+)

```javascript
// test-api.js
async function testPluginFilesAPI() {
  const url = 'http://localhost:3000/plugin/files';
  const requestBody = {
    userId: '684f19962ac039c3142b1172',
    pluginName: 'SayHiOnJoin'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success!');
      console.log(`📁 Retrieved ${Object.keys(data.files).length} files`);
      console.log('📋 File list:');
      Object.keys(data.files).forEach(filePath => {
        console.log(`  📄 ${filePath}`);
      });
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.log('🔥 Network error:', error.message);
  }
}

testPluginFilesAPI();
```

**Run with:**
```bash
node test-api.js
```

#### Using axios (if installed)

```javascript
const axios = require('axios');

async function testWithAxios() {
  try {
    const response = await axios.post('http://localhost:3000/plugin/files', {
      userId: '684f19962ac039c3142b1172',
      pluginName: 'SayHiOnJoin'
    });

    if (response.data.success) {
      console.log('✅ Success!');
      console.log('Files:', Object.keys(response.data.files));
    } else {
      console.log('❌ Error:', response.data.error);
    }
  } catch (error) {
    console.log('🔥 Request failed:', error.message);
  }
}

testWithAxios();
```

### 4. Python Testing

#### Using requests library

```python
import requests
import json

def test_plugin_files_api():
    url = 'http://localhost:3000/plugin/files'
    payload = {
        'userId': '684f19962ac039c3142b1172',
        'pluginName': 'SayHiOnJoin'
    }
    
    try:
        response = requests.post(url, json=payload)
        data = response.json()
        
        if data['success']:
            print(f"✅ Success! Retrieved {len(data['files'])} files")
            print("📋 File list:")
            for file_path in data['files'].keys():
                print(f"  📄 {file_path}")
        else:
            print(f"❌ Error: {data['error']}")
            
    except requests.exceptions.RequestException as e:
        print(f"🔥 Network error: {e}")
    except json.JSONDecodeError as e:
        print(f"🔥 JSON parsing error: {e}")

if __name__ == "__main__":
    test_plugin_files_api()
```

**Run with:**
```bash
pip install requests
python test_api.py
```

### 5. Postman Testing

**Setup:**
1. Create new POST request
2. URL: `http://localhost:3000/plugin/files`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "userId": "684f19962ac039c3142b1172",
  "pluginName": "SayHiOnJoin"
}
```

**Expected Response:**
- Status: 200 OK
- Body: JSON with `success: true` and `files` object

### 6. Advanced Testing Scenarios

#### Test Error Conditions

**Missing User ID:**
```bash
curl -X POST http://localhost:3000/plugin/files \
  -H "Content-Type: application/json" \
  -d '{"pluginName": "SayHiOnJoin"}'
```

**Missing Plugin Name:**
```bash
curl -X POST http://localhost:3000/plugin/files \
  -H "Content-Type: application/json" \
  -d '{"userId": "684f19962ac039c3142b1172"}'
```

**Non-existent Plugin:**
```bash
curl -X POST http://localhost:3000/plugin/files \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "684f19962ac039c3142b1172",
    "pluginName": "NonExistentPlugin"
  }'
```

**Non-existent User:**
```bash
curl -X POST http://localhost:3000/plugin/files \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "nonexistent-user-id",
    "pluginName": "SayHiOnJoin"
  }'
```

#### Performance Testing

**Measure Response Time:**
```bash
time curl -X POST http://localhost:3000/plugin/files \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "684f19962ac039c3142b1172",
    "pluginName": "SayHiOnJoin"
  }' > /dev/null
```

**Multiple Concurrent Requests:**
```bash
for i in {1..5}; do
  curl -X POST http://localhost:3000/plugin/files \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "684f19962ac039c3142b1172",
      "pluginName": "SayHiOnJoin"
    }' &
done
wait
```

## Integration Testing

### Frontend Integration Test

Create a simple HTML file to test integration:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Plugin Files API Test</title>
</head>
<body>
    <h1>Plugin Files API Test</h1>
    <button onclick="testAPI()">Test API</button>
    <div id="result"></div>

    <script>
    async function testAPI() {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = 'Loading...';
        
        try {
            const response = await fetch('/plugin/files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: '684f19962ac039c3142b1172',
                    pluginName: 'SayHiOnJoin'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                resultDiv.innerHTML = `
                    <h3>✅ Success!</h3>
                    <p>Retrieved ${Object.keys(data.files).length} files:</p>
                    <ul>
                        ${Object.keys(data.files).map(path => `<li>${path}</li>`).join('')}
                    </ul>
                `;
            } else {
                resultDiv.innerHTML = `<h3>❌ Error:</h3><p>${data.error}</p>`;
            }
        } catch (error) {
            resultDiv.innerHTML = `<h3>🔥 Network Error:</h3><p>${error.message}</p>`;
        }
    }
    </script>
</body>
</html>
```

## Expected Results

### Successful Response Structure

```json
{
  "success": true,
  "files": {
    "src/main/java/com/example/sayhionjoin/SayHiOnJoinPlugin.java": "package com.example.sayhionjoin;\n\nimport org.bukkit.plugin.java.JavaPlugin;\n\npublic final class SayHiOnJoinPlugin extends JavaPlugin {\n\n    @Override\n    public void onEnable() {\n        // Plugin startup logic\n        getLogger().info(\"SayHiOnJoin plugin has been enabled!\");\n        \n        // Register the player join listener\n        getServer().getPluginManager().registerEvents(new PlayerJoinListener(), this);\n    }\n\n    @Override\n    public void onDisable() {\n        // Plugin shutdown logic\n        getLogger().info(\"SayHiOnJoin plugin has been disabled!\");\n    }\n}",
    "src/main/java/com/example/sayhionjoin/PlayerJoinListener.java": "package com.example.sayhionjoin;\n\nimport org.bukkit.entity.Player;\nimport org.bukkit.event.EventHandler;\nimport org.bukkit.event.Listener;\nimport org.bukkit.event.player.PlayerJoinEvent;\nimport org.bukkit.scheduler.BukkitRunnable;\nimport org.bukkit.plugin.java.JavaPlugin;\n\npublic class PlayerJoinListener implements Listener {\n\n    @EventHandler\n    public void onPlayerJoin(PlayerJoinEvent event) {\n        Player player = event.getPlayer();\n        \n        // Send welcome message\n        player.sendMessage(\"§6Welcome to the server, \" + player.getName() + \"!\");\n        \n        // Spawn fireworks after a short delay\n        new BukkitRunnable() {\n            @Override\n            public void run() {\n                FireworkManager.spawnFireworks(player);\n            }\n        }.runTaskLater(JavaPlugin.getProvidingPlugin(this.getClass()), 40L); // 2 second delay\n    }\n}",
    "src/main/resources/plugin.yml": "name: SayHiOnJoin\nversion: 1.0.0\nmain: com.example.sayhionjoin.SayHiOnJoinPlugin\napi-version: 1.20\nauthor: YourName\ndescription: A plugin that says hi when players join\n",
    "pom.xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<project xmlns=\"http://maven.apache.org/POM/4.0.0\"\n         xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n         xsi:schemaLocation=\"http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd\">\n    <modelVersion>4.0.0</modelVersion>\n\n    <groupId>com.example</groupId>\n    <artifactId>sayhionjoin</artifactId>\n    <version>1.0.0</version>\n    <packaging>jar</packaging>\n\n    <name>SayHiOnJoin</name>\n\n    <properties>\n        <java.version>17</java.version>\n        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>\n    </properties>\n\n    <build>\n        <plugins>\n            <plugin>\n                <groupId>org.apache.maven.plugins</groupId>\n                <artifactId>maven-compiler-plugin</artifactId>\n                <version>3.8.1</version>\n                <configuration>\n                    <source>${java.version}</source>\n                    <target>${java.version}</target>\n                </configuration>\n            </plugin>\n            <plugin>\n                <groupId>org.apache.maven.plugins</groupId>\n                <artifactId>maven-shade-plugin</artifactId>\n                <version>3.2.4</version>\n                <executions>\n                    <execution>\n                        <phase>package</phase>\n                        <goals>\n                            <goal>shade</goal>\n                        </goals>\n                        <configuration>\n                            <createDependencyReducedPom>false</createDependencyReducedPom>\n                        </configuration>\n                    </execution>\n                </executions>\n            </plugin>\n        </plugins>\n        <resources>\n            <resource>\n                <directory>src/main/resources</directory>\n                <filtering>true</filtering>\n            </resource>\n        </resources>\n    </build>\n\n    <repositories>\n        <!-- This adds the Spigot Maven repository to the build -->\n        <repository>\n            <id>spigot-repo</id>\n            <url>https://hub.spigotmc.org/nexus/content/repositories/snapshots/</url>\n        </repository>\n    </repositories>\n\n    <dependencies>\n        <!--This adds the Spigot API artifact to the build -->\n        <dependency>\n            <groupId>org.spigotmc</groupId>\n            <artifactId>spigot-api</artifactId>\n            <version>1.20.1-R0.1-SNAPSHOT</version>\n            <scope>provided</scope>\n        </dependency>\n    </dependencies>\n</project>"
  }
}
```

### Common File Types Returned

- **Java Source Files** (`.java`) - Main plugin code
- **Maven POM** (`pom.xml`) - Build configuration
- **Plugin Configuration** (`plugin.yml`) - Bukkit plugin metadata
- **Properties Files** (`.properties`) - Configuration files
- **JSON Files** (`.json`) - Data and configuration
- **Markdown Files** (`.md`) - Documentation

## Troubleshooting

### Common Issues

1. **"Plugin not found" Error**
   - Verify the userId and pluginName are correct
   - Check if the plugin directory exists in `generated/{userId}/{pluginName}`
   - Ensure the plugin was successfully generated

2. **Empty Files Response**
   - Check if the plugin directory contains any supported file types
   - Verify file permissions allow reading

3. **Connection Refused**
   - Ensure the server is running on port 3000
   - Check firewall settings
   - Verify the correct localhost URL

4. **Timeout Errors**
   - Large plugins may take longer to read
   - Check server logs for memory issues
   - Consider pagination for very large plugins

### Debug Steps

1. **Check Server Logs**: Look for error messages in the console
2. **Verify Plugin Exists**: Check the file system manually
3. **Test with Different Plugins**: Try a smaller plugin first
4. **Check Network**: Verify connectivity to the server
5. **Validate JSON**: Ensure request body is valid JSON

## Performance Considerations

- **File Size Limits**: Very large files may impact response time
- **Number of Files**: Plugins with many files will take longer to process
- **Network Bandwidth**: Large responses may be slow on limited connections
- **Memory Usage**: Large plugins may require more server memory

## Security Notes

- API validates input parameters to prevent path traversal
- Only text files are returned (binary files are excluded)
- File content is returned as-is without modification
- No authentication is currently implemented (consider adding if needed)

This testing guide provides comprehensive methods to verify the Plugin Files API functionality across different platforms and use cases.
