export default function RunBanner() {
  const runText = 'RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 RUN \u00a0\u00b7\u00a0 ';
  const subText = 'Ohhhhhhh. No time to rest. Just do your best. Ohhhhhhh. What you hear is not a test. We\u2019re only here to make you. We\u2019re only here to make you. We\u2019re only here to make you. We\u2019re only here to make you. Go! \u00a0\u00b7\u00a0 ';

  return (
    <div className="w-full overflow-hidden bg-[#5B7FFF] py-2 select-none" aria-hidden="true">
      <div className="animate-marquee whitespace-nowrap flex">
        <span className="run-text">{runText}</span>
        <span className="run-text">{runText}</span>
      </div>
      <div className="animate-marquee-reverse whitespace-nowrap flex mt-0.5">
        <span className="run-subtext">{subText}</span>
        <span className="run-subtext">{subText}</span>
      </div>
    </div>
  );
}
