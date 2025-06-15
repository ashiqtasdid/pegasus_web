export function LoadingState() {
  return (
    <div className="mt-8">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <div className="inline-flex items-center">
            <div className="animate-pulse h-4 w-4 bg-indigo-600 rounded-full mr-3"></div>
            <span className="text-lg font-medium text-gray-900">
              Generating your plugin
              <span className="inline-block animate-bounce">.</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            This may take a few moments. The AI is creating and compiling your plugin.
          </p>
        </div>
      </div>
    </div>
  );
}
