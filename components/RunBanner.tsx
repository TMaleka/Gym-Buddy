export default function RunBanner() {
  const text = 'RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 ';

  return (
    <div className="w-full overflow-hidden bg-[#5B7FFF] py-2 select-none" aria-hidden="true">
      <div className="animate-marquee whitespace-nowrap flex">
        <span className="run-text">{text}</span>
        <span className="run-text">{text}</span>
      </div>
    </div>
  );
}
