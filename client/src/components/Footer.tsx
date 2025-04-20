export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <a href="#" className="text-gray-500 hover:text-gray-700">
              About
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              Help
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              Privacy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              Terms
            </a>
          </div>
          <div className="mt-8 md:mt-0 flex justify-center">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} QuizCraft. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
