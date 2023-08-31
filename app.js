warehouse = {
      d1: document.getElementById('d1'),
      d2: document.getElementById('d2'),
      d3: document.getElementById('d3'),
    };

class Form {
  constructor(form) {
    this.form = form;
  }

  updateItemAmount(depositID, itemName, amountChange) {
    const existingItemElement = warehouse[depositID].querySelector(`.item[data-name="${itemName}"]`);
    if (existingItemElement) {
      const currentAmount = parseInt(existingItemElement.getAttribute('data-amount'));
      const newAmount = currentAmount + amountChange;
      if (newAmount < 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Cantidad indicada mayor a la existente.',
        });
      } else {
        existingItemElement.setAttribute('data-amount', newAmount);
        existingItemElement.querySelector('p').textContent = `${itemName} - Cantidad: ${newAmount}`;
      }
    } else if (amountChange >= 0) {
      const newItemElement = document.createElement('div');
      newItemElement.className = 'item';
      newItemElement.setAttribute('data-name', itemName);
      newItemElement.setAttribute('data-amount', amountChange);
      newItemElement.innerHTML = `<p>${itemName} - Cantidad: ${amountChange}</p>`;
      warehouse[depositID].appendChild(newItemElement);
    }
  }

  addItem() {
    const itemName = this.form.querySelector('.item-name').value.toUpperCase();
    const itemAmount = parseInt(this.form.querySelector('.item-amount').value);
    const depositID = this.form.querySelector('.destiny-deposit').value;

    this.updateItemAmount(depositID, itemName, itemAmount);
  };

  removeItem() {
    const itemName = this.form.querySelector('.item-name').value.toUpperCase();
    const itemAmount = parseInt(this.form.querySelector('.item-amount').value);
    const depositID = this.form.querySelector('.origin-deposit').value;

    const existingItemElement = warehouse[depositID].querySelector(`.item[data-name="${itemName}"]`);
    if (!existingItemElement) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El elemento que intentas quitar no existe en el depósito seleccionado.',
      });
      return;
    }

    this.updateItemAmount(depositID, itemName, -itemAmount);
  };

  moveItem() {
    const itemName = this.form.querySelector('.item-name').value.toUpperCase();
    const itemAmount = parseInt(this.form.querySelector('.item-amount').value);
    const originDepositID = this.form.querySelector('.origin-deposit').value;
    const destinyDepositID = this.form.querySelector('.destiny-deposit').value;

    this.form.querySelector('.origin-deposit').value = originDepositID;
    this.form.querySelector('.item-amount').value = itemAmount;
    this.removeItem();

    this.form.querySelector('.destiny-deposit').value = destinyDepositID;
    this.form.querySelector('.item-amount').value = itemAmount;
    this.addItem();
  }
}

const formsContainer = document.querySelector('.forms_container')
const selectForm = document.getElementById('select-form');
let selectedForm;

selectForm.addEventListener('change', function() {
  const allForms = formsContainer.getElementsByTagName('form');
  for (const form of allForms) {
  form.style.display = 'none';
}
  const selectedFormId = selectForm.value;
  if (selectedFormId !== "0") {
    selectedForm = document.getElementById(selectedFormId)
    selectedForm.style.display = 'block';
  }
});

formsContainer.addEventListener('submit', function(event) {
  event.preventDefault();
  if (selectedForm) {
    const form = new Form(selectedForm);
    if (selectedForm.id === 'add-item_form') {
      form.addItem();
    } else if (selectedForm.id === 'remove-item_form') {
      form.removeItem();
    } else if (selectedForm.id === 'move-item_form') {
      form.moveItem();
    }
  }
})

// Guardar en un JSON y elegir la ruta
const saveButton = document.getElementById('save-button');
saveButton.addEventListener('click', async function() {
  const dataToSave = {};

  for (const depositID in warehouse) {
    const depositElement = warehouse[depositID];
    const items = depositElement.querySelectorAll('.item');
    const depositData = [];

    for (const item of items) {
      const itemName = item.getAttribute('data-name');
      const itemAmount = parseInt(item.getAttribute('data-amount'));
      depositData.push({ name: itemName, amount: itemAmount });
    }

    dataToSave[depositID] = depositData;
  }

  const dataBlob = new Blob([JSON.stringify(dataToSave)], { type: 'application/json' });

  try {
    const fileHandle = await window.showSaveFilePicker();
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(dataBlob);
    await writableStream.close();

    Swal.fire({
      icon: 'success',
      title: 'Cambios guardados',
      text: 'Cambios guardados en el archivo JSON local.',
    });
  } catch (error) {
    console.error('Error saving data:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Hubo un error al guardar los cambios en el archivo JSON local.',
    });
  }
});

// Recuperar desde un JSON local por ruta
const loadButton = document.getElementById('load-button');
loadButton.addEventListener('click', async function() {
  try {
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const fileContents = await file.text();
    const savedData = JSON.parse(fileContents);

    for (const depositID in savedData) {
      const depositElement = warehouse[depositID];

      const divElements = depositElement.querySelectorAll('.item');
      for (const divElement of divElements) {
        depositElement.removeChild(divElement);
      }

      for (const itemData of savedData[depositID]) {
        const newItemElement = document.createElement('div');
        newItemElement.className = 'item';
        newItemElement.setAttribute('data-name', itemData.name);
        newItemElement.setAttribute('data-amount', itemData.amount);
        newItemElement.innerHTML = `<p>${itemData.name} - Cantidad: ${itemData.amount}</p>`;
        depositElement.appendChild(newItemElement);
      }
    }

    Swal.fire({
      icon: 'info',
      title: 'Datos cargados',
      text: 'Datos cargados desde el archivo JSON local.',
    });
  } catch (error) {
    console.error('Error loading data:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Hubo un error al cargar los datos desde el archivo JSON local.',
    });
  }
});

function loadSavedData() {
  const savedDataJSON = localStorage.getItem('storageData');
  if (savedDataJSON) {
    const savedData = JSON.parse(savedDataJSON);

    for (const depositID in savedData) {
      const depositElement = warehouse[depositID];

      const divElements = depositElement.querySelectorAll('.item');
      for (const divElement of divElements) {
        depositElement.removeChild(divElement);
      }

      for (const itemData of savedData[depositID]) {
        const newItemElement = document.createElement('div');
        newItemElement.className = 'item';
        newItemElement.setAttribute('data-name', itemData.name);
        newItemElement.setAttribute('data-amount', itemData.amount);
        newItemElement.innerHTML = `<p>${itemData.name} - Cantidad: ${itemData.amount}</p>`;
        depositElement.appendChild(newItemElement);
      }
    }

    Swal.fire({
      icon: 'info',
      title: 'Datos cargados',
      text: 'Datos cargados desde el Local Storage.',
    });
  }
}

loadSavedData();

let autoSaveInterval;

function saveDataAutomatically() {
  const dataToSave = {};

  for (const depositID in warehouse) {
    const depositElement = warehouse[depositID];
    const items = depositElement.querySelectorAll('.item');
    const depositData = [];

    for (const item of items) {
      const itemName = item.getAttribute('data-name');
      const itemAmount = parseInt(item.getAttribute('data-amount'));
      depositData.push({ name: itemName, amount: itemAmount });
    }

    dataToSave[depositID] = depositData;
  }

  localStorage.setItem('storageData', JSON.stringify(dataToSave));
  console.log('Cambios guardados automáticamente.');
}

const intervalTime = 5 * 60 * 1000; // 5 minutos en milisegundos
setInterval(saveDataAutomatically, intervalTime);

function stopAutoSaveInterval() {
  clearInterval(autoSaveInterval);
}

window.addEventListener('beforeunload', function() {
  stopAutoSaveInterval();

  saveDataAutomatically();
});

startAutoSaveInterval();




// Guardar en local storage
/*
const saveButton = document.getElementById('save-button');
saveButton.addEventListener('click', function() {
  const dataToSave = {};

  const savedDataJSON = localStorage.getItem('storageData');
  if (savedDataJSON) {
    const savedData = JSON.parse(savedDataJSON);

    for (const depositID in savedData) {
      dataToSave[depositID] = savedData[depositID];
    }
  }

  for (const depositID in warehouse) {
    const depositElement = warehouse[depositID];
    const items = depositElement.querySelectorAll('.item');
    const depositData = [];

    for (const item of items) {
      const itemName = item.getAttribute('data-name');
      const itemAmount = parseInt(item.getAttribute('data-amount'));
      depositData.push({ name: itemName, amount: itemAmount });
    }

    dataToSave[depositID] = depositData;
  }

  localStorage.setItem('storageData', JSON.stringify(dataToSave));
  Swal.fire({
      icon: 'success',
      title: 'Cambios guardados',
      text: 'Cambios guardados en la memoria local.',
    });
});

const loadButton = document.getElementById('load-button');

loadButton.addEventListener('click', function() {
  const savedDataJSON = localStorage.getItem('storageData');
  if (savedDataJSON) {
    const savedData = JSON.parse(savedDataJSON);

    for (const depositID in savedData) {
      const depositElement = warehouse[depositID];
      
      const divElements = depositElement.querySelectorAll('.item');
      for (const divElement of divElements) {
        depositElement.removeChild(divElement);
      }

      for (const itemData of savedData[depositID]) {
        const newItemElement = document.createElement('div');
        newItemElement.className = 'item';
        newItemElement.setAttribute('data-name', itemData.name);
        newItemElement.setAttribute('data-amount', itemData.amount);
        newItemElement.innerHTML = `<p>${itemData.name} - Cantidad: ${itemData.amount}</p>`;
        depositElement.appendChild(newItemElement);
      }
    }
    Swal.fire({
      icon: 'info',
      title: 'Datos cargados',
      text: 'Datos cargados desde la memoria local.',
    });
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'No hay datos',
      text: 'No hay datos guardados en la memoria local.',
    });
  }
});
*/

// hola, a este código me gastaría agregarle una funcionalidad de que con un event loop me guarde cada cierto tiempo en el local storage  del navegador los datos de los depositos.