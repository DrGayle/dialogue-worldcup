export default function Welcome({ onStart }) {
  return (
    <div className="text-center flex flex-col items-center gap-6 pt-10">
      <p className="uppercase tracking-widest text-sm font-medium text-teal-600">
        Dialogue
      </p>
      <h1 className="text-4xl sm:text-5xl font-bold text-teal-800 leading-tight">
        The World Cup Team Game
      </h1>
      <p className="max-w-xl text-lg text-teal-700">
        Answer five questions and meet your symbolic English-learning team —
        eleven players and one coach from the World Cup, chosen for the stories
        they share with you.
      </p>
      <button
        onClick={onStart}
        className="mt-2 rounded-full bg-teal-500 px-8 py-3 text-lg font-medium text-white shadow-sm transition hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
      >
        Begin
      </button>
    </div>
  );
}
