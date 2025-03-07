export default function WorkInProgress() {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800">
        <h1 className="text-4xl font-bold">🚧 Work in Progress 🚧</h1>
        <p className="text-lg mt-4">We're working hard to bring you this feature soon.</p>
        <a
          href="/"
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Home
        </a>
      </div>
    );
  }
  