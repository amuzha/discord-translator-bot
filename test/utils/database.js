export const mockDB = {
  guilds: [],
  users: [],
  translations: [],
  sent: []
};

let db = JSON.parse(JSON.stringify(mockDB));

export function loadDB() { return db; }
export function saveDB(data) { db = data; }
export function clearDB() { db = JSON.parse(JSON.stringify(mockDB)); }
export function addUser(user) { db.users.push(user); }
export function addGuild(guild) { db.guilds.push(guild); }
