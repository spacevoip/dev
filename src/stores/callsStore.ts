import { create } from 'zustand';

interface ActiveCall {
  Accountcode: string;
  Application: string;
  BridgeID: string;
  CallerID: string;
  Channel: string;
  Context: string;
  Data: string;
  Duration: string;
  Extension: string;
  PeerAccount: string;
  Prio: string;
  State: string;
}

interface CallsState {
  activeCalls: ActiveCall[];
  totalCalls: number;
  callingCalls: number;
  talkingCalls: number;
  lastUpdate: Date;
  updateCalls: (calls: ActiveCall[]) => void;
}

export const useCallsStore = create<CallsState>((set) => ({
  activeCalls: [],
  totalCalls: 0,
  callingCalls: 0,
  talkingCalls: 0,
  lastUpdate: new Date(),
  updateCalls: (calls) => {
    const activeCalls = calls.filter(call => call.Application === "Dial");
    set({
      activeCalls,
      totalCalls: activeCalls.length,
      callingCalls: activeCalls.filter(call => call.State === "Ring").length,
      talkingCalls: activeCalls.filter(call => call.State === "Up").length,
      lastUpdate: new Date()
    });
  }
}));
