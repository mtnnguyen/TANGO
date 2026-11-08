/** Data boundary: account-level benchmark aggregates, loaded only when needed. */
let cached;
let cachedFindings;

export async function loadAccountSummaries() {
  if (!cached) {
    cached = fetch('/public/data/account_summaries.json')
      .then(response => {
        if (!response.ok) throw new Error('Account research extract is unavailable');
        return response.json();
      })
      .then(data => {
        if (data.schemaVersion !== 1 || !data.accounts || typeof data.accounts !== 'object') {
          throw new Error('Unsupported dataset schema');
        }
        return data;
      })
      .catch(error => { cached = undefined; throw error; });
  }
  return cached;
}

export function selectAccount(dataset, accountId) {
  if (!/^\d{1,12}$/.test(String(accountId))) throw new Error('Enter a numeric account ID');
  const account = dataset.accounts[String(accountId)];
  if (!account) throw new Error(`Account ${accountId} was not found in this dataset`);
  return { id: String(accountId), summary: structuredClone(account) };
}

export async function loadResearchFindings() {
  if (!cachedFindings) {
    cachedFindings = fetch('/public/data/research_findings.json')
      .then(response => {
        if (!response.ok) throw new Error('Research findings are unavailable');
        return response.json();
      })
      .catch(error => { cachedFindings = undefined; throw error; });
  }
  return cachedFindings;
}
