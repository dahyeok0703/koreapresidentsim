import { useEffect } from 'react';
import { useGame } from './store';
import SetupScreen from './components/SetupScreen';
import TopBar from './components/TopBar';
import ApprovalPanel from './components/ApprovalPanel';
import ChatPanel from './components/ChatPanel';
import RightTabs from './components/RightTabs';
import EventChoiceModal from './components/EventChoiceModal';
import PresidentCard from './components/PresidentCard';

export default function App() {
  const state = useGame(s => s.state);
  const hydrate = useGame(s => s.hydrate);
  const error = useGame(s => s.error);

  useEffect(() => { hydrate(); }, [hydrate]);

  if (!state) return <SetupScreen />;

  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      {error && (
        <div className="bg-red-950/60 border-b border-red-800 text-red-200 text-xs px-3 py-1">
          ⚠ {error}
        </div>
      )}
      <div className="flex-1 overflow-hidden grid grid-cols-12 gap-2 p-2">
        <div className="col-span-3 overflow-y-auto space-y-2 pr-1">
          <PresidentCard />
          <ApprovalPanel />
        </div>
        <div className="col-span-5 flex flex-col overflow-hidden">
          <ChatPanel />
        </div>
        <div className="col-span-4 overflow-hidden">
          <RightTabs />
        </div>
      </div>
      <EventChoiceModal />
    </div>
  );
}
