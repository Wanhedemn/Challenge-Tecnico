export default function FormularioPreTriage() {
  return (
    <form className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Cuestionario de Pre-Triage</h2>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-700">¿Te has realizado tatuajes o piercings en los últimos 12 meses?</p>
          <div className="flex items-center gap-6 mt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 select-none">
              <input
                type="radio"
                name="tatuajes"
                value="si"
                className="h-4 w-4 text-red-600 border-slate-300 focus:ring-red-500 cursor-pointer"
              />
              <span>Sí</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 select-none">
              <input
                type="radio"
                name="tatuajes"
                value="no"
                className="h-4 w-4 text-red-600 border-slate-300 focus:ring-red-500 cursor-pointer"
              />
              <span>No</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
