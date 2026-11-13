export const POPUP_BLOCKED = "Your browser blocked the new tab. Allow pop-ups for GetDreamJob, then try again.";

export async function openInNewTab(load: () => Promise<{ url: string }>): Promise<void> {
  const tab = window.open("", "_blank");
  if (!tab) throw new Error(POPUP_BLOCKED);
  tab.opener = null;
  try {
    const { url } = await load();
    tab.location.href = url;
  } catch (error: unknown) {
    tab.close();
    throw error;
  }
}
