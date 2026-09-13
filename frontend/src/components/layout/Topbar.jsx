export default function Topbar({ title }) {
  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6">
      <h3 className="text-lg font-semibold">{title}</h3>

      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center">
        U
      </div>
    </header>
  );
}
