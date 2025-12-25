import HomePage from "@/components/home-page";

// Force dynamic rendering - this page fetches data at request time
export const dynamic = 'force-dynamic';

export default function Page() {
  return <HomePage />;
}
