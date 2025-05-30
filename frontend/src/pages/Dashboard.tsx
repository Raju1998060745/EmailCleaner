import { useState, useEffect } from "react";
import {
  Mail,
  BarChart,
  RefreshCw,
  CheckCircle,
  LogOut,
} from "lucide-react";
import ActionCard from "../components/ActionCard";
import SyncResults from "../components/SyncResults";
import TopSendersChart from "../components/TopSendersChart";
import {
  fetchSyncEmails,
  fetchTopSenders,
  fetchProfile,       // ← NEW
  disconnect,
  API_BASE_URL,
} from "../utils/api";
import { SyncStats, TopSender } from "../types";

export default function Dashboard() {
  /* ─── state ──────────────────────────────────────────────── */
  const [isConnected, setIsConnected] = useState(false);
  const [profileEmail, setProfileEmail] = useState("");     // ← NEW

  const [lastSynced, setLastSynced] = useState<Date | null>(() => {
    const ts = localStorage.getItem("lastSynced");
    return ts ? new Date(ts) : null;
  });

  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [topSenders, setTopSenders] = useState<TopSender[]>([]);
  const [isLoadingSync, setIsLoadingSync] = useState(false);
  const [isLoadingTopSenders, setIsLoadingTopSenders] = useState(false);
  const [view, setView] = useState<"none" | "sync" | "senders">("none");

  /* ─── on mount: try /profile to detect login + email ─────── */
  useEffect(() => {
    (async () => {
      try {
        const email = await fetchProfile();
        setProfileEmail(email);
        setIsConnected(true);
      } catch {
        setIsConnected(false);
        setProfileEmail("");
      }
    })();
  }, []);

  /* ─── helpers ─────────────────────────────────────────────── */
  const refreshTopSenders = async () => {
    setIsLoadingTopSenders(true);
    try {
      const data = await fetchTopSenders();
      setTopSenders(data);
    } finally {
      setIsLoadingTopSenders(false);
    }
  };

  const handleSyncInbox = async () => {
    setIsLoadingSync(true);
    setView("sync");
    try {
      const data = await fetchSyncEmails();
      setSyncStats(data);
      const now = new Date();
      setLastSynced(now);
      localStorage.setItem("lastSynced", now.toISOString());
    } finally {
      setIsLoadingSync(false);
    }
  };

  const handleShowTopSenders = () => {
    setView("senders");
    refreshTopSenders();
  };

  const handleSwitchAccount = async () => {
    try {
      await disconnect();
    } finally {
      window.location.href = `${API_BASE_URL}/authorize`;
    }
  };

  /* ─── UI ──────────────────────────────────────────────────── */
  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold mb-6">Email Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Connect Gmail */}
        <ActionCard
          title="Connect Gmail"
          description={
            isConnected
              ? `Connected: ${profileEmail}`
              : "Link your Gmail account"
          }
          icon={
            isConnected ? (
              <CheckCircle className="text-green-400" size={24} />
            ) : (
              <Mail className="text-pink-500" size={24} />
            )
          }
          buttonText={isConnected ? "Connected" : "Connect"}
          onClick={() => {
            if (!isConnected) window.location.href = `${API_BASE_URL}/authorize`;
          }}
          disabled={isConnected}
          gradient="from-pink-500 to-purple-500"
        />

        {/* Sync Inbox */}
        <ActionCard
          title="Sync Inbox"
          description={
            lastSynced
              ? `Last synced: ${lastSynced.toLocaleString()}`
              : "Synchronize emails for analysis"
          }
          icon={<RefreshCw className="text-blue-500" size={24} />}
          buttonText="Start Sync"
          onClick={handleSyncInbox}
          isLoading={isLoadingSync}
          gradient="from-blue-500 to-indigo-500"
        />

        {/* Top Senders */}
        <ActionCard
          title="Top Senders"
          description="View who emails you most"
          icon={<BarChart className="text-emerald-500" size={24} />}
          buttonText="Show Chart"
          onClick={handleShowTopSenders}
          isLoading={isLoadingTopSenders}
          gradient="from-emerald-500 to-teal-500"
        />
      </div>

      {/* Switch account link */}
      {isConnected && (
        <button
          className="mb-6 flex items-center gap-1 text-sm text-blue-400 hover:underline"
          onClick={handleSwitchAccount}
        >
          <LogOut size={16} />
          Switch Gmail account
        </button>
      )}

      {/* Conditional results section */}
      {view === "sync" && (
        <SyncResults isLoading={isLoadingSync} stats={syncStats} />
      )}

      {view === "senders" && (
        <TopSendersChart
          isLoading={isLoadingTopSenders}
          data={topSenders}
          onRefresh={refreshTopSenders}
        />
      )}
    </div>
  );
}
