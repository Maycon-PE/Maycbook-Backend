# MAYCBOOK

## Pojeto client-side:
[Maycbook-Frontend](https://github.com/Maycon-PE/Maycbook-Frontend "Repositório")

## FINALIDADE
	Projeto desenvolvido para portfólio.
	Feito para à prática de desenvolvimento backend (NodeJS), implementando encriptação, variáveis de ambientes, token, banco de dados relacional e não relacional.

## Rotas

Rotas com o prefixo `/auth` passará por um middleware que verifica a validade do token.

- POST	
	- `/user` - Cria um usuário e inicia uma seção;
	- `/login` - Inicia uma seção;
	- `/auth/reconnect` - Possibilita uma reconexão;
	- `/auth/action/:recipient/:action` - Executa uma ação de notificação.
	
