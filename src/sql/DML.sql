-- First creation scripts
-- Role
INSERT INTO role(
	uuid, name, description, elevation, details, "isActive", options)
	VALUES ('wpxk61870Z', 'Administrator', 'Administrator of the whole system', 0, null, true, null);

INSERT INTO role(
	uuid, name, description, elevation, details, "isActive", options)
	VALUES ('WW4CfXMl09', 'User', 'Normal user of the system', 0, null, true, null);

-- Company
INSERT INTO company(
	uuid, name, "shortName", logo, slogan, details, "isActive", description, options)
	VALUES ('snVYXSDBEU', 'Process Management and Business Solutions', 'PM^BS', null, 'Ve más allá', null, true, 'Gestión de Procesos de Negocio, Análisis de Negocio, BPM, Desarrollo de Software', null);

-- Person
INSERT INTO person(
	uuid, names, "lastNames", dni, phone, "mobilePhone", address, reference, birthdate, details, "isActive", email)
	VALUES ('D3Z5DYlExz', '8fa845cae49574ba0544ac81997a4b31', 'aa265515082dd89ebb68059a8c189654', 'c9e56d179fe5fc394d51aa9ce4117c7d', null, 'a8a425258e829e3c54e645d284de3349', 'e0de7b48b701e0cfede114775caa8ee8774726aef76ccae41047ad976fded94b1466fbb8923879fa9076b8fc8ffd112c4663bf73d0c901afaf102d78d15e57e724dbceaee56c8334fa7376175a172aa6', null, '1984-09-17', null, true, 'fffad943fa51652591e913da0841c238c46d7e992c387251234fd8d4c9e3ebad');

-- User
INSERT INTO "user"(
	uuid, nick, email, password, details, "isActive", "roleId", "companyId", "personId")
	VALUES ('pyjxP1DpHS', 'dpperalta', 'necrosoft.ec@gmail.com', '$2a$10$PjYJb3CqN4ptYjy/Knz0te4eDiSJZU948wJ6BHGGbQUutTtT34.Qu', null, true, (select "roleId" from "role" where "name" like 'Administrator'), 1, 1);