const { UserService } = require('../src/userService');

function createValidUser(service, overrides = {}) {
	const baseData = {
		nome: 'Fulano de Tal',
		email: 'fulano@teste.com',
		idade: 25,
		isAdmin: false,
	};
	const userData = { ...baseData, ...overrides };
	return service.createUser(
		userData.nome,
		userData.email,
		userData.idade,
		userData.isAdmin
	);
}

describe('UserService', () => {
	let userService;

	beforeEach(() => {
		userService = new UserService();
		userService._clearDB();
	});

	test('1. createUser cria um usuário válido e permite recuperação por id', () => {
		const expectedData = {
			nome: 'Fulano de Tal',
			email: 'fulano@teste.com',
			idade: 25,
		};

		const createdUser = userService.createUser(
			expectedData.nome,
			expectedData.email,
			expectedData.idade
		);
		const fetchedUser = userService.getUserById(createdUser.id);

		expect(createdUser).toMatchObject({
			...expectedData,
			status: 'ativo',
			isAdmin: false,
		});
		expect(fetchedUser).toEqual(createdUser);
	});

	test('2. deactivateUser retorna true e define status inativo para usuário não administrador', () => {
		const activeUser = createValidUser(userService);

		const result = userService.deactivateUser(activeUser.id);
		const updatedUser = userService.getUserById(activeUser.id);

		expect(result).toBe(true);
		expect(updatedUser.status).toBe('inativo');
	});

	test('3. deactivateUser retorna false e mantém status ativo para administrador', () => {
		const adminUser = createValidUser(userService, { nome: 'Admin', email: 'admin@teste.com', isAdmin: true });

		const result = userService.deactivateUser(adminUser.id);
		const fetchedAdmin = userService.getUserById(adminUser.id);

		expect(result).toBe(false);
		expect(fetchedAdmin.status).toBe('ativo');
	});

	test('4. deactivateUser retorna false quando o usuário não existe', () => {
		const nonexistentUserId = 'nonexistent-id';

		const result = userService.deactivateUser(nonexistentUserId);
		const storedUser = userService.getUserById(nonexistentUserId);

		expect(result).toBe(false);
		expect(storedUser).toBeNull();
	});

	test('5. generateUserReport inclui cabeçalho e dados básicos dos usuários ativos', () => {
		const userOne = createValidUser(userService, { nome: 'Alice', email: 'alice@email.com' });
		const userTwo = createValidUser(userService, { nome: 'Bob', email: 'bob@email.com' });

		const report = userService.generateUserReport();
		const lines = report.trimEnd().split('\n');
		const bodyLines = lines.slice(1);

		expect(lines[0]).toBe('--- Relatório de Usuários ---');
		expect(bodyLines).toEqual(
			expect.arrayContaining([
				`ID: ${userOne.id}, Nome: ${userOne.nome}, Status: ${userOne.status}`,
				`ID: ${userTwo.id}, Nome: ${userTwo.nome}, Status: ${userTwo.status}`,
			])
		);
	});

	test('6. generateUserReport informa ausência de usuários quando o cadastro está vazio', () => {
		const report = userService.generateUserReport();

		expect(report).toBe('--- Relatório de Usuários ---\nNenhum usuário cadastrado.');
	});

	test('7. createUser lança erro ao tentar cadastrar usuário menor de idade', () => {
		const createMinor = () => userService.createUser('Menor', 'menor@email.com', 17);

		expect(createMinor).toThrow('O usuário deve ser maior de idade.');
	});
});
