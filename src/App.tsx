import { useEffect } from 'react';
import { useGame } from './store';
import SetupScreen from './components/SetupScreen';
import TopBar from './components/TopBar';
import NewsTicker from './components/NewsTicker';
import ApprovalPanel from './components/ApprovalPanel';
import EconomyPanel from './components/EconomyPanel';
import SocialPanel from './components/SocialPanel';
import SecurityPanel from './components/SecurityPanel';
import DiplomacyPanel from './components/DiplomacyPanel';
import AssemblyPanel from './components/AssemblyPanel';
import CabinetPanel from './components/CabinetPanel';
import MediaPanel from './components/MediaPanel';
import EventsPanel from './components/EventsPanel';
import EventChoiceModal from './components/EventChoiceModal';
import ChatPanel from './components/ChatPanel';
import ActionsPanel from './components/ActionsPanel';

export default function App() {
  const state = useGame(s => s.state);
  const hydrate = useGame(s => s.hydrate);
  const error = useGame(s => s.error);

  useEffect(() => { hydrate(); }, [hydrate]);

  if (!state) return <SetupScreen />;

  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      <NewsTicker />
      {error && (
        <div className="bg-red-950/60 border-b border-red-800 text-red-200 text-xs px-3 py-1">
          ⚠ {error}
        </div>
      )}
      <div className="flex-1 overflow-hidden grid grid-cols-12 gap-2 p-2">
        {/* 좌측: 거시 지표 */}
        <div className="col-span-3 overflow-y-auto space-y-2 pr-1">
          <ApprovalPanel />
          <EconomyPanel />
          <SocialPanel />
        </div>

        {/* 중앙: 채팅 + 액션 */}
        <div className="col-span-5 flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 min-h-0">
            <ChatPanel />
          </div>
          <div className="h-72 overflow-y-auto">
            <ActionsPanel />
          </div>
        </div>

        {/* 우측: 이벤트 + 외교/안보/국회/내각/언론 */}
        <div className="col-span-4 overflow-y-auto space-y-2 pr-1">
          <EventsPanel />
          <SecurityPanel />
          <DiplomacyPanel />
          <AssemblyPanel />
          <CabinetPanel />
          <MediaPanel />
        </div>
      </div>
      <EventChoiceModal />
    </div>
  );
}
