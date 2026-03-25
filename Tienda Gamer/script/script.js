// 🔥 CONFIG
const NUMERO_WPP = "5491128655916";
let carritoGlobal = {};

// 🔹 INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {

    const miniCarrito = document.getElementById("miniCarrito");
    const panel = document.getElementById("panelCarrito");
    const cerrarPanel = document.getElementById("cerrarPanel");
    const topBar = document.querySelector(".top-bar");

    // 🔹 CARGAR CARRITO DE LOCALSTORAGE
    const guardado = JSON.parse(localStorage.getItem("carritoTemporal"));
    if (guardado) carritoGlobal = guardado;

    // 🔹 ELEMENTOS DE PRODUCTOS
    const cards = document.querySelectorAll(".card");
    if (cards.length > 0) {
        cards.forEach(card => {
            const addBtn = card.querySelector(".btn-agregar");
            const plusBtns = card.querySelectorAll(".plus");
            const minusBtns = card.querySelectorAll(".minus");
            const dropdownBtn = card.querySelector(".dropdown-toggle");
            const wppBtn = card.querySelector(".btn-wpp");

            if (!dropdownBtn) return;

            // 🔹 FUNCION PARA OBTENER PEDIDO DE ESTA CARD
            function obtenerPedido() {
                const nombreProducto = card.querySelector(".card-title")?.innerText || "";
                const filas = card.querySelectorAll(".dropdown-menu li");

                let pedido = "";
                let total = 0;

                filas.forEach(fila => {
                    const talleEl = fila.querySelector(".talle");
                    const countEl = fila.querySelector(".count");
                    if (!talleEl || !countEl) return;

                    const talle = talleEl.dataset.talle;
                    const cantidad = parseInt(countEl.innerText) || 0;

                    if (cantidad > 0) {
                        pedido += `• ${cantidad} unidad(es) - Talle ${talle}\n`;
                        total += cantidad;
                    }
                });

                return { nombreProducto, pedido: pedido.trim(), total };
            }

            // 🔹 ACTUALIZAR LINK DE WHATSAPP POR CARD
            function updateWhatsApp() {
                if (!wppBtn) return;
                const { nombreProducto, pedido, total } = obtenerPedido();

                if (total > 0) {
                    dropdownBtn.innerText = `${total} seleccionados`;
                    const mensaje = `Quiero esta remera:\nProducto: ${nombreProducto}\n${pedido}`;
                    wppBtn.href = `https://wa.me/${NUMERO_WPP}?text=${encodeURIComponent(mensaje)}`;
                    wppBtn.classList.remove("disabled");
                } else {
                    dropdownBtn.innerText = "Elegí tu talle";
                    wppBtn.removeAttribute("href");
                    wppBtn.classList.add("disabled");
                }
            }

            // 🔹 BOTÓN AGREGAR AL CARRITO
            if (addBtn) {
                addBtn.addEventListener("click", () => {
                    const { nombreProducto, pedido, total } = obtenerPedido();
                    if (total > 0) {
                        // GUARDA TODA LA INFO DEL PRODUCTO
                        carritoGlobal[nombreProducto] = pedido;
                        localStorage.setItem("carritoTemporal", JSON.stringify(carritoGlobal));

                        card.classList.add("bounce");
                        setTimeout(() => card.classList.remove("bounce"), 300);

                        updateMiniCarrito();
                        updateBotonFinal();
                        renderPanel();
                    } else {
                        alert("Seleccioná al menos un talle");
                    }
                });
            }

            // 🔹 BOTONES + / -
            plusBtns.forEach(btn => {
                btn.addEventListener("click", e => {
                    e.stopPropagation();
                    const count = btn.previousElementSibling;
                    if (!count) return;
                    count.innerText = (parseInt(count.innerText) || 0) + 1;
                    updateWhatsApp();
                });
            });
            minusBtns.forEach(btn => {
                btn.addEventListener("click", e => {
                    e.stopPropagation();
                    const count = btn.nextElementSibling;
                    if (!count) return;
                    if ((parseInt(count.innerText) || 0) > 0) {
                        count.innerText = parseInt(count.innerText) - 1;
                        updateWhatsApp();
                    }
                });
            });

            // 🔹 Inicializa link al cargar
            updateWhatsApp();
        });
    }

    // 🔹 ABRIR / CERRAR PANEL
    if (miniCarrito && panel) {
        miniCarrito.addEventListener("click", () => {
            if (Object.keys(carritoGlobal).length === 0) return;
            panel.classList.add("activo");
            renderPanel();
            miniCarrito.style.display = "none";
        });
    }
    if (cerrarPanel && panel) {
        cerrarPanel.addEventListener("click", () => {
            panel.classList.remove("activo");
            updateMiniCarrito();
        });
    }

    // 🔹 TOP BAR
    window.addEventListener("scroll", () => {
        if (!topBar) return;
        if (window.scrollY > 100) topBar.classList.add("hidden");
        else topBar.classList.remove("hidden");
    });

    updateMiniCarrito();
    updateBotonFinal();
});

// 🔹 MINI-CARRITO
function updateMiniCarrito() {
    const miniCarrito = document.getElementById("miniCarrito");
    const contador = document.getElementById("contadorCarrito");
    if (!miniCarrito || !contador) return;

    let totalItems = 0;
    for (let producto in carritoGlobal) {
        const cantidades = carritoGlobal[producto].match(/(\d+)/g);
        if (cantidades) cantidades.forEach(n => totalItems += parseInt(n));
    }

    if (totalItems > 0) {
        contador.innerText = totalItems;
        miniCarrito.style.display = "flex";
    } else {
        contador.innerText = "0";
        miniCarrito.style.display = "none";
        const panel = document.getElementById("panelCarrito");
        if (panel) panel.classList.remove("activo");
    }
}

// 🔹 PANEL DE CARRITO
function renderPanel() {
    const contenido = document.getElementById("contenidoCarrito");
    const totalEl = document.getElementById("totalCarrito");
    if (!contenido) return;

    contenido.innerHTML = "";
    let totalPrecio = 0;

    for (let producto in carritoGlobal) {
        const card = [...document.querySelectorAll(".card")]
            .find(c => c.querySelector(".card-title")?.innerText === producto);

        const imgSrc = card?.querySelector("img")?.src || "";
        const precio = parseInt(card?.querySelector(".product-price")?.innerText.replace(/\D/g, "")) || 0;
        const cantidades = carritoGlobal[producto].match(/(\d+)/g);
        let totalUnidades = 0;

        if (cantidades) {
            cantidades.forEach(num => {
                totalUnidades += parseInt(num);
                totalPrecio += parseInt(num) * precio;
            });
        }

        const div = document.createElement("div");
        div.classList.add("item-carrito");
        div.innerHTML = `
            <img src="${imgSrc}">
            <div class="item-info">
                <strong>${producto}</strong>
                <small>${carritoGlobal[producto].replace(/\n/g,"<br>")}</small>
            </div>
            <div class="controles">
                <span>${totalUnidades}</span>
            </div>
            <button class="btn-eliminar" data-producto="${producto}">🗑️</button>
        `;
        contenido.appendChild(div);
    }

    if (totalEl) totalEl.innerText = `Total: $${totalPrecio.toLocaleString("es-AR")}`;

    updateBotonFinal();

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", e => {
            const producto = e.currentTarget.dataset.producto;
            delete carritoGlobal[producto];
            localStorage.setItem("carritoTemporal", JSON.stringify(carritoGlobal));
            renderPanel();
            updateMiniCarrito();
        });
    });
}

// 🔹 BOTÓN FINAL DE WHATSAPP
function updateBotonFinal() {
    const botonesFinal = document.querySelectorAll(".btn-final");
    let mensajeFinal = "Hola, quiero pedir:\n\n";

    for (let producto in carritoGlobal) {
        if(carritoGlobal[producto] && carritoGlobal[producto] !== "") {
            mensajeFinal += `${producto}:\n${carritoGlobal[producto]}\n`;
        }
    }

    const link = `https://wa.me/${NUMERO_WPP}?text=${encodeURIComponent(mensajeFinal)}`;

    botonesFinal.forEach(btn => {
        btn.href = link;
        if (Object.keys(carritoGlobal).length === 0) {
            btn.classList.add("disabled");
            btn.removeAttribute("target");
        } else {
            btn.classList.remove("disabled");
            btn.setAttribute("target","_blank");
        }
    });
}

