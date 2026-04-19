import prisma from "@/lib/prisma";

export default async function TestDBPage() {
  let membersCount = 0;
  let error = null;

  try {
    membersCount = await prisma.anggota.count();
  } catch (e) {
    console.error(e);
    error = e.message;
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      {error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      ) : (
        <div className="p-4 bg-green-100 text-green-700 rounded">
          Success! Total members in database: <span className="font-bold">{membersCount}</span>
        </div>
      )}
      <div className="mt-4">
        <a href="/" className="text-blue-500 hover:underline">Go back home</a>
      </div>
    </div>
  );
}
