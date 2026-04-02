export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <h1 className="text-4xl font-bold text-blue-700">Welcome to e-Hotels</h1>
      <p className="text-gray-600 text-lg max-w-xl text-center">
        Search and book hotel rooms across 5 major chains in North America. Are you a guest or a hotel employee?
      </p>
      <div className="flex gap-6 mt-4">
        <a
          href="/customer/search"
          className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow"
        >
          I&apos;m a Customer
        </a>
        <a
          href="/employee/checkin"
          className="bg-gray-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition shadow"
        >
          I&apos;m an Employee
        </a>
      </div>
    </div>
  );
}
