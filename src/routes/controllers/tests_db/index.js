
module.exports = {

	index(req, res) {

		// OK

		/* 1 - user :
		*     - Busca todos os usuários.
		*
		*  2 - post :
		*     - Busca todos as publicações.
		*
		*  3 - todos :
		*     - Busca todos os usuários e publicações.
		*/

		const table = req.query.table

		console.log('table ', table)

		const then = (data) => {
			console.log('data ', data)

			res.json({ table: table === 'user' || table === 'post' ? table : 'todas', data })
		}

		const catch_f = (err) => {
			console.log('err ', err)

			res.send(`<h1>failed - ${ table }</h1>`)
		}


		switch(table) {
			case 'user':

				req
					.mysql('user')
					.then(data => then(data))
					.catch(err => catch_f(err))

				break;
			case 'post':

				req
					.mysql('post')
					.then(data => then(data))
					.catch(err => catch_f(err))

				break;
			default: 
				
				req
					.mysql('user')
					.then(users => {

						req
							.mysql('post')
							.then(posts => then({ users, posts }))
							.catch(err => catch_f(err))

					})
					.catch(err => catch_f(err))
		}

	},

	insert(req, res) {
		// OK

		/* 1 - user :
		*			- Insere o usuário;
		*		  - Não aceita e-mail repetido;
		*		  - Necessita setar o `friends. 
		*		  	\ Porque não aceita nulo e não conseguir por valor default dentro da migrate.
		*
		*	 2 - post : 
		*			- Insere a publicação;
		*  		- Não aceita `author_id` e `author` nulo;
		*			- Não aceita um valor que não contém na coluna `id` da tabela `user`
		*				\ para ser a chave estrangeira no campo `author_id`.
		*/

		const then = (text, value) => {
			console.log(text, value)

			res.send('<h1>success</h1>')
		}

		const catch_f = (err) => {
			console.log(err)
			
			res.send('<h1>failed</h1>')
		}


		const user = {
			name: 'Maycon',
			email: 'emailtest@hotmail.com',
			password: '12344',
			friends: JSON.stringify({data:[]})
		}

		const post = {
			author: 'Maycon',
			description: 'Descrição teste!!!'
		}

		req
			.mysql('user')
			.insert(user)
			.then(([ id ]) => {
				console.log('user_id ', id)

				req
					.mysql('post')
					.insert({ ...post, author_id: id })
					.then(([ id ]) => then('post_id', id))
					.catch(err => catch_f(err))

			}).catch(err => catch_f(err))
	},

	del(req, res) {
		// OK

		/* 1 - user :
		*			- Não apagará um registro que tenha a chave primária
		*				\ como chave estrangeira em uma outra tabela.
		*
		*	 2 - post : 
		*    	- É apagada com sucesso.
		*/

		const table = req.query.table

		console.log('table ', table)

		const then = (data) => {
			console.log('data ', data)

			res.send(`<h1>success - ${ table }</h1>`)
		}

		const catch_f = (err) => {
			console.log(err)

			res.send(`<h1>failed - ${ table }</h1>`)			
		}

		if (table === 'user') {
			req
			.mysql('user')
			.first()
			.del()
			.then(data => then(data))
			.catch(err => catch_f(err))
		} else {
			req
			.mysql('post')
			.first()
			.del()
			.then(data => then(data))
			.catch(err => catch_f(err))
		}
	},

	latest(req, res) {
		// OK

		/*
		* - Coloca o banco de dados na última versão!	
		*/

		req.mysql.migrate.latest()

		res.send('<h1>latest</h1>')
	},

	rollback(req, res) {
		// OK

		/*
		* - Reseta o banco de dados!	
		*/

		req.mysql.migrate.rollback()

		res.send('<h1>rollback</h1>')
	}

}
