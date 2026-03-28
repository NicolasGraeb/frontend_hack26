"use client";

import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import DocumentsView from "@/components/DocumentsView";
import MoreView from "@/components/MoreView";
import ServicesView from "@/components/ServicesView";
import QrCodeView from "@/components/QrCodeView";
import { useNavigation } from "@/store/navigation";

function ActiveView() {
  const { activeTab } = useNavigation();

  switch (activeTab) {
    case "dokumenty":
      return <DocumentsView />;
    case "uslugi":
      return <ServicesView />;
    case "kod-qr":
      return <QrCodeView />;
    case "wiecej":
      return <MoreView />;
    default:
      return (
        <div className="flex flex-1 items-center justify-center text-[var(--color-text-secondary)]">
          <p className="text-lg">Wkrótce...</p>
        </div>
      );
  }
}

export default function Home() {
  return (
    <div className="flex min-h-dvh bg-[var(--color-bg)] font-sans">
      <SideNav />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Header />
        <main className="no-scrollbar flex flex-1 flex-col overflow-y-auto">
          <ActiveView />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
