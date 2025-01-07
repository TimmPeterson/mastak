/*** Основные типы данных для представления данных о пользователях и комнатах ***/

// Тип представляющий одного пользователя
export class user {
  constructor(name, meta) {
    this.name = name;
    this.meta = meta;
  }
}

// Тип представляющий одну комнату
export class room {
  constructor(title, admin, meta) {
    this.title = title;
    this.admin = admin;
    this.meta = meta;
    this.membersList = [admin];
    this.addMember = (newMember) => {
      this.membersList.push(newMember);
    };
  }
}
