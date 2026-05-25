window.validarPasoActual = function(paso, dtoRef) {
    limpiarErrores();
    let esValido = true;

    if (paso === 1) {
        const peso = parseFloat(document.getElementById('peso').value);
        const estatura = parseFloat(document.getElementById('estatura').value);

        if (isNaN(peso) || peso < 30 || peso > 250) {
            document.getElementById('error-peso').textContent = "Peso inválido (30 - 250 kg)";
            esValido = false;
        } else {
            dtoRef.peso = peso;
        }

        if (isNaN(estatura) || estatura < 100 || estatura > 250) {
            document.getElementById('error-estatura').textContent = "Estatura inválida (100 - 250 cm)";
            esValido = false;
        } else {
            dtoRef.estatura = estatura;
        }
    }

    if (paso === 2) {
        const objetivoSel = document.querySelector('#contenedor-objetivos .seleccionado');
        if (!objetivoSel) {
            document.getElementById('error-objetivo').textContent = "Debes seleccionar un objetivo";
            esValido = false;
        } else {
            dtoRef.idObjetivo = parseInt(objetivoSel.getAttribute('data-id'));
        }
    }

    if (paso === 3) {
        const nivelSel = document.querySelector('#contenedor-niveles .seleccionado');
        if (!nivelSel) {
            document.getElementById('error-nivel').textContent = "Debes seleccionar un nivel";
            esValido = false;
        } else {
            dtoRef.idNivel = parseInt(nivelSel.getAttribute('data-id'));
        }
    }

    // Paso 4 no necesita validación (limitaciones son opcionales)
    return esValido;
};

function limpiarErrores() {
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
}