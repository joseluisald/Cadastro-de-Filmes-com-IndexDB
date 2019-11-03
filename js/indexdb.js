let openRequest = window.indexedDB.open("hotelflow", 1)
let DB;

openRequest.onupgradeneeded = () => 
{
    DB = openRequest.result
    DB.createObjectStore("filmes", {keyPath: "idFilme", autoIncrement: true});
}