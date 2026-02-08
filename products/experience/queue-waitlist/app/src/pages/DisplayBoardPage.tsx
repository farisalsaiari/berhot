import { Card } from '@berhot/ui';

interface QueueDisplay {
  position: number;
  name: string;
  partySize: number;
  estimatedWait: string;
}

const NOW_SERVING = 12;

const NEXT_IN_QUEUE: QueueDisplay[] = [
  { position: 13, name: 'Fatima H.', partySize: 2, estimatedWait: '~3 min' },
  { position: 14, name: 'Omar B.', partySize: 6, estimatedWait: '~8 min' },
  { position: 15, name: 'Noura F.', partySize: 3, estimatedWait: '~14 min' },
  { position: 16, name: 'Ahmed M.', partySize: 2, estimatedWait: '~18 min' },
  { position: 17, name: 'Layla Q.', partySize: 5, estimatedWait: '~24 min' },
];

export default function DisplayBoardPage() {
  return (
    <div className="space-y-6">
      {/* Preview Label */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Display Board Preview</h2>
          <p className="text-xs text-gray-400 mt-0.5">This is how the display board will appear on a TV or monitor</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
            Open Fullscreen
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition">
            Copy Display URL
          </button>
        </div>
      </div>

      {/* Display Board Preview */}
      <div className="bg-slate-900 rounded-2xl p-10 min-h-[500px]">
        {/* Now Serving */}
        <div className="text-center mb-12">
          <div className="text-white/40 text-lg uppercase tracking-widest mb-3">Now Serving</div>
          <div className="text-white text-9xl font-black leading-none">#{NOW_SERVING}</div>
          <div className="text-blue-400 text-lg mt-3 font-medium">Khalid Al-Rashid &middot; Party of 4</div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mx-auto max-w-2xl mb-10" />

        {/* Next Up */}
        <div className="max-w-2xl mx-auto">
          <div className="text-white/40 text-sm uppercase tracking-widest mb-4 text-center">Coming Up Next</div>
          <div className="space-y-3">
            {NEXT_IN_QUEUE.map((entry) => (
              <div
                key={entry.position}
                className="flex items-center justify-between bg-white/5 rounded-xl px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-white/80">#{entry.position}</span>
                  <div>
                    <div className="text-white font-medium">{entry.name}</div>
                    <div className="text-white/40 text-sm">Party of {entry.partySize}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-sm">Est. Wait</div>
                  <div className="text-white font-semibold">{entry.estimatedWait}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <div className="text-white/20 text-sm">Average wait time today: <span className="text-white/40">12 minutes</span></div>
        </div>
      </div>
    </div>
  );
}
