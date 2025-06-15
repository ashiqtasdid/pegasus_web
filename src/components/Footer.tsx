import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Powered by OpenRouter AI • Built with NestJS • 
            <Heart className="inline w-4 h-4 text-red-500 mx-1" />
            for Minecraft Plugin Developers
          </p>
        </div>
      </div>
    </footer>
  );
}
