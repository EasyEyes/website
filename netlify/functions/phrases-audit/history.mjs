export async function listReviewRuns(fetchPage, limit = 20) {
  let cursor = null;
  let recent = [];
  while (true) {
    const page = await fetchPage(cursor);
    if (cursor === null) recent = page;
    const completed = page.find((run) => run.status === "completed");
    if (completed) return cursor === null ? recent : [...recent, completed];
    if (page.length < limit) return recent;
    cursor = page[page.length - 1].id;
  }
}
