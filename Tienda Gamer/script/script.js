let carritoGlobal = {};

document.addEventListener("DOMContentLoaded", () => {

    // 🔹 CARGAR LO GUARDADO
    const guardado = JSON.parse(localStorage.getItem("carritoTemporal"));
    if (guardado) {
        carritoGlobal = guardado;
    }

    const cards = document.querySelectorAll(".card");
    if (cards.length === 0) return;

    // 🔥 RESTAURAR UI PRIMERO
    cards.forEach(card => {

        const nombreProducto = card.querySelector(".card-title")?.innerText;
        if (!nombreProducto || !carritoGlobal[nombreProducto]) return;

        const pedido = carritoGlobal[nombreProducto];
        const filas = card.querySelectorAll(".dropdown-menu li");

        let total = 0;

        filas.forEach(fila => {

            const talleEl = fila.querySelector(".talle");
            const countEl = fila.querySelector(".count");

            if (!talleEl || !countEl) return;

            const talle = talleEl.dataset.talle;

            const regex = new RegExp(`(\\d+) en talle ${talle}`);
            const match = pedido.match(regex);

            if (match) {
                const cantidad = parseInt(match[1]);
                countEl.innerText = cantidad;
                total += cantidad;
            }
        });

        const dropdownBtn = card.querySelector(".dropdown-toggle");
        const button = card.querySelector(".btn-wpp");

        if (total > 0) {
            dropdownBtn.innerText = `${total} seleccionados`;
            button.classList.remove("disabled");
        }

    });

    // 🔥 ACTIVAR BOTONES Y LÓGICA
    cards.forEach(card => {

        const button = card.querySelector(".btn-wpp");
        const plusBtns = card.querySelectorAll(".plus");
        const minusBtns = card.querySelectorAll(".minus");
        const dropdownBtn = card.querySelector(".dropdown-toggle");

        if (!button || !dropdownBtn) return;

        function updateWhatsApp() {

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
                    pedido += `${cantidad} en talle ${talle}\n`;
                    total += cantidad;
                }
            });

            if (total > 0) {

                dropdownBtn.innerText = `${total} seleccionados`;

                const numero = "5491130814198";
                const mensaje = `Hola quiero:\n${nombreProducto}\n${pedido}`;

                button.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
                button.classList.remove("disabled");

                carritoGlobal[nombreProducto] = pedido;

            } else {

                dropdownBtn.innerText = "Elegí tu talle";
                button.href = "#";
                button.classList.add("disabled");

                delete carritoGlobal[nombreProducto];
            }

            updateBotonFinal();

            // 🔥 GUARDAR
            localStorage.setItem("carritoTemporal", JSON.stringify(carritoGlobal));
        }

        plusBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();

                const count = btn.previousElementSibling;
                if (!count) return;

                count.innerText = (parseInt(count.innerText) || 0) + 1;
                updateWhatsApp();
            });
        });

        minusBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();

                const count = btn.nextElementSibling;
                if (!count) return;

                if ((parseInt(count.innerText) || 0) > 0) {
                    count.innerText = parseInt(count.innerText) - 1;
                    updateWhatsApp();
                }
            });
        });

    });

    // 🔹 MODAL
    document.querySelectorAll(".img-click").forEach(img => {
        img.addEventListener("click", function () {

            const modalImg = document.getElementById("modalImage");
            const modalEl = document.getElementById("imgModal");

            if (!modalImg || !modalEl) return;

            modalImg.src = this.src;

            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        });
    });

    // 🔥 ACTUALIZAR BOTÓN GLOBAL AL CARGAR
    updateBotonFinal();
});


// 🔥 BOTÓN GLOBAL
function updateBotonFinal() {

    const botonesFinal = document.querySelectorAll(".btn-final");
    const contenedores = document.querySelectorAll(".contenedorFinal");

    let mensajeFinal = "Hola, ¿Cómo estás? Quisiera pedir:\n\n";
    let cantidadProductos = 0;

    for (let producto in carritoGlobal) {
        mensajeFinal += `${producto}:\n${carritoGlobal[producto]}\n`;
        cantidadProductos++;
    }

    if (cantidadProductos >= 1) {

        const numero = "5491128655916";
        const link = `https://wa.me/${numero}?text=${encodeURIComponent(mensajeFinal)}`;

        botonesFinal.forEach(btn => {
            btn.href = link;
        });

        contenedores.forEach(cont => {
            cont.style.display = "block";
        });

    } else {

        contenedores.forEach(cont => {
            cont.style.display = "none";
        });
    }
}