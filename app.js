/* ==========================================================
   Súper Barrio - Lógica del sistema de stock
   ========================================================== */

/* [Acá va tu comentario de registro de IA: app.js no existía, así que pegalo en esta línea] */

/* ---------- 1. DATOS Y ALMACENAMIENTO ---------- */

// Clave con la que se guardan todos los datos en localStorage
const CLAVE_ALMACENAMIENTO = "stock-datos";

// Arrays principales de la aplicación
// categorias:  { nombre }
// productos:   { codigo, nombre, categoria, unidad, precio, stockInicial, stockMinimo }
// movimientos: { codigo, tipo, motivo, cantidad, fecha, observacion }
let categorias = [];
let productos = [];
let movimientos = [];

// Guarda los tres arrays juntos en localStorage
function guardarDatos() {
  const datos = { categorias, productos, movimientos };
  localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(datos));
}

// Carga los datos guardados; si no hay nada, usa los datos iniciales
function cargarDatos() {
  let datosGuardados = null;

  try {
    datosGuardados = JSON.parse(localStorage.getItem(CLAVE_ALMACENAMIENTO));
  } catch (error) {
    datosGuardados = null; // Si el JSON está dañado, se parte de cero
  }

  if (datosGuardados) {
    categorias = datosGuardados.categorias || [];
    productos = datosGuardados.productos || [];
    movimientos = datosGuardados.movimientos || [];
  } else {
    cargarDatosIniciales();
    guardarDatos();
  }
}

// Datos ficticios para la primera vez que se abre el sistema
function cargarDatosIniciales() {
  categorias = [
    { nombre: "Almacén" },
    { nombre: "Lácteos" },
    { nombre: "Limpieza" },
    { nombre: "Bebidas" }
  ];

  productos = [
    { codigo: "7791234500011", nombre: "Arroz largo fino 1 kg",   categoria: "Almacén",  unidad: "paquete", precio: 1850, stockInicial: 40, stockMinimo: 10 },
    { codigo: "7791234500028", nombre: "Fideos spaghetti 500 g",  categoria: "Almacén",  unidad: "paquete", precio: 1200, stockInicial: 6,  stockMinimo: 15 },
    { codigo: "7791234500035", nombre: "Leche entera 1 L",        categoria: "Lácteos",  unidad: "litro",   precio: 1450, stockInicial: 30, stockMinimo: 12 },
    { codigo: "7791234500042", nombre: "Yogur firme vainilla",    categoria: "Lácteos",  unidad: "unidad",  precio: 980,  stockInicial: 0,  stockMinimo: 8 },
    { codigo: "7791234500059", nombre: "Queso cremoso",           categoria: "Lácteos",  unidad: "kg",      precio: 7800, stockInicial: 12, stockMinimo: 4 },
    { codigo: "7791234500066", nombre: "Lavandina 1 L",           categoria: "Limpieza", unidad: "unidad",  precio: 1100, stockInicial: 25, stockMinimo: 6 },
    { codigo: "7791234500073", nombre: "Detergente 750 ml",       categoria: "Limpieza", unidad: "unidad",  precio: 2300, stockInicial: 18, stockMinimo: 8 },
    { codigo: "7791234500080", nombre: "Gaseosa cola 2,25 L",     categoria: "Bebidas",  unidad: "unidad",  precio: 2900, stockInicial: 48, stockMinimo: 20 }
  ];

  movimientos = [];
}

/* ---------- 2. CATEGORÍAS: ALTA, EDICIÓN Y BAJA ---------- */

// Elementos del HTML que usa esta sección
const formularioCategoria = document.getElementById("form-categoria");
const campoNombreCategoria = document.getElementById("categoria-nombre");
const listaCategorias = document.getElementById("lista-categorias");

// Busca si ya existe una categoría con ese nombre (sin distinguir mayúsculas)
// "ignorarNombre" permite excluir la categoría que se está editando
function existeCategoria(nombre, ignorarNombre = "") {
  return categorias.some(function (categoria) {
    return (
      categoria.nombre.toLowerCase() === nombre.toLowerCase() &&
      categoria.nombre.toLowerCase() !== ignorarNombre.toLowerCase()
    );
  });
}

// Valida el nombre: obligatorio y único. Devuelve un mensaje de error o "" si está bien
function validarNombreCategoria(nombre, ignorarNombre = "") {
  if (nombre === "") {
    return "El nombre de la categoría es obligatorio.";
  }
  if (existeCategoria(nombre, ignorarNombre)) {
    return "Ya existe una categoría con ese nombre.";
  }
  return "";
}

// ALTA: agrega una categoría nueva
function agregarCategoria(nombre) {
  const mensajeError = validarNombreCategoria(nombre);
  if (mensajeError) {
    alert(mensajeError);
    return false;
  }

  categorias.push({ nombre: nombre });
  guardarDatos();
  mostrarCategorias();
  return true;
}

// EDICIÓN: cambia el nombre y actualiza los productos que la usaban
function editarCategoria(nombreActual) {
  const nombreNuevo = prompt("Nuevo nombre de la categoría:", nombreActual);

  if (nombreNuevo === null) return; // Canceló la edición

  const nombreLimpio = nombreNuevo.trim();
  const mensajeError = validarNombreCategoria(nombreLimpio, nombreActual);
  if (mensajeError) {
    alert(mensajeError);
    return;
  }

  // Cambia el nombre en la categoría
  const categoria = categorias.find(function (c) {
    return c.nombre === nombreActual;
  });
  categoria.nombre = nombreLimpio;

  // Cambia el nombre también en los productos que la tenían asignada
  productos.forEach(function (producto) {
    if (producto.categoria === nombreActual) {
      producto.categoria = nombreLimpio;
    }
  });

  guardarDatos();
  mostrarCategorias();
}

// BAJA: elimina la categoría solo si no tiene productos
function eliminarCategoria(nombre) {
  const tieneProductos = productos.some(function (producto) {
    return producto.categoria === nombre;
  });

  if (tieneProductos) {
    alert("No se puede eliminar \"" + nombre + "\" porque tiene productos asignados.");
    return;
  }

  if (!confirm("¿Eliminar la categoría \"" + nombre + "\"?")) return;

  categorias = categorias.filter(function (categoria) {
    return categoria.nombre !== nombre;
  });

  guardarDatos();
  mostrarCategorias();
}

// Dibuja la lista de categorías y actualiza los selectores de productos
function mostrarCategorias() {
  listaCategorias.innerHTML = "";

  categorias.forEach(function (categoria) {
    const elemento = document.createElement("li");

    const textoNombre = document.createElement("span");
    textoNombre.textContent = categoria.nombre;

    const botonEditar = document.createElement("button");
    botonEditar.type = "button";
    botonEditar.textContent = "✏️ Editar";
    botonEditar.dataset.accion = "editar";
    botonEditar.dataset.nombre = categoria.nombre;

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.textContent = "🗑️ Eliminar";
    botonEliminar.className = "boton-peligro";
    botonEliminar.dataset.accion = "eliminar";
    botonEliminar.dataset.nombre = categoria.nombre;

    elemento.append(textoNombre, botonEditar, botonEliminar);
    listaCategorias.appendChild(elemento);
  });

  actualizarSelectoresCategoria();
}

// Rellena los selectores de categoría (formulario de productos y filtro)
function actualizarSelectoresCategoria() {
  const selectorProducto = document.getElementById("producto-categoria");
  const selectorFiltro = document.getElementById("filtro-categoria");

  // Guarda lo que estaba seleccionado para no perderlo al redibujar
  const valorProducto = selectorProducto.value;
  const valorFiltro = selectorFiltro.value;

  selectorProducto.innerHTML = '<option value="">Seleccionar...</option>';
  selectorFiltro.innerHTML = '<option value="">Todas las categorías</option>';

  categorias.forEach(function (categoria) {
    selectorProducto.add(new Option(categoria.nombre, categoria.nombre));
    selectorFiltro.add(new Option(categoria.nombre, categoria.nombre));
  });

  selectorProducto.value = valorProducto;
  selectorFiltro.value = valorFiltro;
}

// Alta: al enviar el formulario se agrega la categoría
formularioCategoria.addEventListener("submit", function (evento) {
  evento.preventDefault(); // Evita que la página se recargue

  const agregada = agregarCategoria(campoNombreCategoria.value.trim());
  if (agregada) {
    formularioCategoria.reset();
  }
});

// Edición y baja: un solo "escuchador" para los botones de toda la lista
listaCategorias.addEventListener("click", function (evento) {
  const boton = evento.target.closest("button");
  if (!boton) return;

  if (boton.dataset.accion === "editar") {
    editarCategoria(boton.dataset.nombre);
  } else if (boton.dataset.accion === "eliminar") {
    eliminarCategoria(boton.dataset.nombre);
  }
});

/* ---------- 3. INICIO DE LA APLICACIÓN ---------- */

cargarDatos();
mostrarCategorias();
