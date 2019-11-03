window.onload = () =>
{
	getFilmes();
}

toastr.options.closeMethod 		= 'fadeOut';
toastr.options.closeDuration 	= 300;

var btnCadastrar 	= document.getElementById('btnCadastrar');
var btnEditar 		= document.getElementById('btnEditar');

var titulo 			= document.getElementById('titulo');
var autor 			= document.getElementById('autor');
var imdb 			= document.getElementById('imdb');
var resumo 			= document.getElementById('resumo');
var dataLanc 		= document.getElementById('data');

var listaFilmes 	= document.getElementById('listaFilmes');

titulo.onblur = () =>
{
	if(btnEditar.value == '')
	{
		var s = titulo.value;
		if(s != '')
		{
			getFilmeByTitle(s);
		}
	}
}

const getFilmeByTitle = (s) =>
{	
	if(s != '')
	{
		var xhttp = new XMLHttpRequest();
		xhttp.open("GET", "http://www.omdbapi.com/?&apikey=89fe2aaa&t="+s, true);
		xhttp.send();
		xhttp.onreadystatechange = (event) =>
		{	
			if (xhttp.readyState == 4 && xhttp.status == 200)
			{
				var data = JSON.parse(xhttp.responseText);

				if(data.Response == 'True')
				{
					const {Actors, imdbRating, Released, Plot} = data;

					autor.value = Actors;
					imdb.value = imdbRating;
					resumo.innerHTML = Plot; 
					dataLanc.value = Released; 
				}
				else
				{	
					toastr.error('Filme não encontrado!');
					clearInputs();
				}	
			}
		}
	}
}

btnCadastrar.onclick = () => 
{
	let filme = 
	{
		titulo: titulo.value,
		autor: autor.value,
		imdb: imdb.value,
		resumo: resumo.value,
		dataLanc: dataLanc.value
	}
	
	DB = openRequest.result;
	let save = DB.transaction("filmes", "readwrite").objectStore("filmes").add(filme);

	save.onsuccess = () =>
	{	
		toastr.success('Filme cadastrado!');
		clearInputs();
		getFilmes();
	}
	save.onerror = () =>
	{
		console.log(save.error);
	}	
}

const getFilmes = () =>
{	
	DB = openRequest.result;
	let get = DB.transaction("filmes", "readonly").objectStore("filmes").getAll();

	get.onsuccess = () => 
	{	
		var html = '';
		html += '<table border="1">';
		html += '<thead>';
		html += '<tr>';
		html += '<th>Titulo</th>';
		html += '<th>Autor</th>';
		html += '<th>IMDB</th>';
		html += '<th>Ano</th>';
		html += '<th>Ações</th>';
		html += '</tr>';
		html += '</thead>';
		html += '<tbody>';

		for(var i = 0; i < get.result.length; i++)
		{	
			const {idFilme, titulo, autor, imdb, dataLanc} = get.result[i]; 

			html += '<tr>';
			html += '<td>'+titulo+'</td>';
			html += '<td>'+autor+'</td>';
			html += '<td>'+imdb+'</td>';
			html += '<td>'+dataLanc+'</td>';
			html += '<td>';
			html += '<buttom type="buttom" class="btn" onclick="delFilme('+idFilme+');"><i class="fa fa-trash" aria-hidden="true"></i></buttom>';
			html += '<buttom type="buttom" class="btn" onclick="editFilme('+idFilme+');"><i class="fa fa-pencil" aria-hidden="true"></i></buttom>';
			html += '</td>';
			html += '</tr>';
		}

		html += '</tbody>';
		html += '</table>';

		listaFilmes.innerHTML = html;
	}
	get.onerror= () => 
	{
		console.log(get.error);
	}
}

const clearInputs = () =>
{
	titulo.value = '';
	autor.value = '';
	imdb.value = '';
	resumo.innerHTML = '';
	dataLanc.value = '';
	titulo.focus();
	btnEditar.value = '';
}

const delFilme = (idFilme) => 
{
	DB = openRequest.result;
	let edit = DB.transaction('filmes', "readwrite");
	var filme = edit.objectStore('filmes');
	var request = filme.delete(idFilme);

	request.onerror =  (event) =>
	{
    	toastr.error('Filme não encontrado!');
	}
	 
	request.onsuccess = (event) =>
	{
		toastr.success('Filme deletado!');
		getFilmes();
	}
}

const editFilme = (idFilme) =>
{	
	DB = openRequest.result;
	let edit = DB.transaction('filmes', "readwrite");
	var filme = edit.objectStore('filmes');
	var request = filme.get(idFilme);
	 
	request.onsuccess = (event) =>
	{	
		btnCadastrar.style.display = 'none';
		btnEditar.style.display = 'block';

		var filme = request.result;

		btnEditar.value = idFilme;
		titulo.value = filme.titulo;	
		autor.value = filme.autor;
		imdb.value = filme.imdb;
		resumo.innerHTML = filme.resumo; 
		dataLanc.value = filme.dataLanc; 
	}

	request.onerror =  (event) =>
	{
    	toastr.error('Ocorreu um erro ao buscar o filme!');
	}	
}

btnEditar.onclick = () =>
{
	var idFilme = parseInt(btnEditar.value);

	DB = openRequest.result;
	let edit = DB.transaction('filmes', "readwrite");
	var filme = edit.objectStore('filmes');
	var request = filme.get(idFilme);

	request.onsuccess = (event) =>
	{	
		var f = request.result;

	    f.titulo = titulo.value;
	    f.autor = autor.value;
	    f.imdb = imdb.value;
	    f.resumo = resumo.value;
	    f.dataLanc = dataLanc.value;

	    var requestUpdate = filme.put(f);

	    requestUpdate.onerror = (event) =>
	    {
	        toastr.error('Ocorreu um erro ao editar o filme!');
	    }

	    requestUpdate.onsuccess = (event) =>
	    {	
	    	btnCadastrar.style.display = 'block';
			btnEditar.style.display = 'none';

	        toastr.success('Filme editado!');
	        getFilmes();
	        clearInputs();
	    }
	}

	request.onerror = (event) =>
	{
	    toastr.error('Ocorreu um erro ao buscar o filme!');
	}
}
