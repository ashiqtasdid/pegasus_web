export function Header() {
  return (
    <nav className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="w-8 h-8 text-white mr-3 text-2xl">🚀</div>
            <h1 className="text-white text-xl font-bold">Pegasus Plugin Generator</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white text-sm">AI-Powered Minecraft Plugin Creation</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
