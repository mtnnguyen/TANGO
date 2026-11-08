/** Entirely fictional people, account identifiers and transactions. Never connect to live accounts. */
const profiles = [
  {
    id: 'demo-maya', name: 'Maya Chen', initials: 'MC', role: 'Student & part-time reservist', accountLabel: 'Everyday Chequing · •• 4821', tone: '#ffc493',
    snapshot: { monthlyIncomeCents: 328000, essentialSpendingCents: 194000, flexibleSpendingCents: 85000, liquidSavingsCents: 496000 },
    goals: [{ name: 'Emergency fund', targetCents: 900000, alreadySavedCents: 496000, monthsToGoal: 18 }, { name: 'Move after graduation', targetCents: 350000, alreadySavedCents: 60000, monthsToGoal: 12 }],
    transactions: [
      ['2026-11-06','Part-time pay','Income',74000], ['2026-11-05','Metro groceries','Groceries',-6425], ['2026-11-04','Presto reload','Transport',-4000],
      ['2026-11-03','Apartment rent','Housing',-118000], ['2026-11-02','Coffee shop','Food & drink',-785], ['2026-11-01','Phone plan','Bills',-5200],
      ['2026-10-29','Weekend shift','Income',57000], ['2026-10-28','Gym membership','Health',-3400], ['2026-10-24','Bookstore','Shopping',-3800]
    ]
  },
  {
    id: 'demo-jordan', name: 'Jordan Ellis', initials: 'JE', role: 'Freelance designer', accountLabel: 'Everyday Chequing · •• 9135', tone: '#c6d9d2',
    snapshot: { monthlyIncomeCents: 620000, essentialSpendingCents: 267000, flexibleSpendingCents: 158000, liquidSavingsCents: 820000 },
    goals: [{ name: 'Tax reserve', targetCents: 1100000, alreadySavedCents: 420000, monthsToGoal: 9 }, { name: 'New equipment', targetCents: 400000, alreadySavedCents: 90000, monthsToGoal: 8 }],
    transactions: [
      ['2026-11-06','Client project deposit','Income',230000], ['2026-11-05','Studio supplies','Work',-16200], ['2026-11-04','Grocery market','Groceries',-9200],
      ['2026-11-03','Studio rent','Housing',-149000], ['2026-11-01','Cloud subscription','Bills',-4100], ['2026-10-28','Client retainer','Income',190000],
      ['2026-10-25','Transit pass','Transport',-12800], ['2026-10-22','Restaurant','Food & drink',-6400]
    ]
  },
  {
    id: 'demo-alex', name: 'Alex Morgan', initials: 'AM', role: 'Career transition', accountLabel: 'Everyday Chequing · •• 2094', tone: '#e8d5ac',
    snapshot: { monthlyIncomeCents: 465000, essentialSpendingCents: 255000, flexibleSpendingCents: 120000, liquidSavingsCents: 1350000 },
    goals: [{ name: 'Career transition fund', targetCents: 1800000, alreadySavedCents: 1350000, monthsToGoal: 15 }, { name: 'Certification course', targetCents: 320000, alreadySavedCents: 35000, monthsToGoal: 10 }],
    transactions: [
      ['2026-11-06','Contract income','Income',152000], ['2026-11-05','Training centre','Education',-14500], ['2026-11-04','Groceries','Groceries',-7900],
      ['2026-11-03','Housing payment','Housing',-171000], ['2026-11-02','Fuel','Transport',-6700], ['2026-10-30','Contract income','Income',116000],
      ['2026-10-27','Insurance','Bills',-12700], ['2026-10-25','Café','Food & drink',-1350]
    ]
  }
];

export function allDemoCustomers() { return profiles.map(({ id, name, initials, role, accountLabel, tone }) => ({ id, name, initials, role, accountLabel, tone })); }

/** Customer-scoped adapter: only the requested owner's objects are returned. */
export function loadDemoCustomer(customerId) {
  const profile = profiles.find(item => item.id === customerId);
  if (!profile) throw new RangeError(`Unknown or unauthorized demo customer: ${customerId}`);
  return structuredClone({ ...profile, snapshot: { customerId, ...profile.snapshot }, transactions: profile.transactions.map(([date, merchant, category, amountCents], index) => ({ id: `${customerId}-${index}`, customerId, date, merchant, category, amountCents })) });
}
