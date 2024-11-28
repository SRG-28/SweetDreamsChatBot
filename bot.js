const Telebot = require("telebot");
const axios = require("axios");
const CONSTANTS = require("./constants");

const bot = new Telebot({
   token: CONSTANTS.TELEGRAM_TOKEN
});

// Función para obtener productos desde la API de Heroku
const getProducts = async () => {
    try {
        const response = await axios.get('https://sweet-dreams-app-v01-526d0a7b9b94.herokuapp.com/v1/product', {
            headers: {
                'Authorization': `Bearer ${CONSTANTS.BEARER_TOKEN}` 
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return null; 
    }
};
// Función para obtener los administradores desde la API de Heroku
const getAdmins = async () => {
  try {
      const response = await axios.get('https://sweet-dreams-app-v01-526d0a7b9b94.herokuapp.com/v1/users?role_id=1', {
          headers: {
              'Authorization': `Bearer ${CONSTANTS.BEARER_TOKEN}`
          }
      });

      return response.data;
  } catch (error) {
      console.error('Error fetching admins:', error);
      return null;
  }
};
// Función para obtener categorías desde la API de Heroku
const getCategories = async () => {
  try {
      const response = await axios.get('https://sweet-dreams-app-v01-526d0a7b9b94.herokuapp.com/v1/category', {
          headers: {
              'Authorization': `Bearer ${CONSTANTS.BEARER_TOKEN}`
          }
      });

      return response.data;
  } catch (error) {
      console.error('Error fetching categories:', error);
      return null;
  }
};

// Comando para obtener y mostrar las categorías
bot.on("/categories", async (msg) => {
  try {
      const categories = await getCategories();

      if (categories) {
          let categoryMessage = 'Here are our product categories:\n\n';

          categories.forEach((category, index) => {
              categoryMessage += `${index + 1}. ${category.name}\n`;
              categoryMessage += `Description: ${category.description}\n\n`;
          });

          await bot.sendMessage(msg.chat.id, categoryMessage);
      } else {
        
          await bot.sendMessage(msg.chat.id, "Sorry, we couldn't fetch the categories at the moment.");
      }
  } catch (error) {
      console.error('Error handling /categories command:', error);
      await bot.sendMessage(msg.chat.id, "Something went wrong while fetching the categories.");
  }
});


// Comando para obtener y mostrar a los administradores
bot.on("/contacts", async (msg) => {
  try {
      const admins = await getAdmins();

      if (admins) {
          let adminMessage = 'Here are our administrators contacts:\n\n';

          admins.forEach((admin, index) => {
              adminMessage += `${index + 1}. ${admin.firstName} ${admin.lastName}\n`;
              adminMessage += `Email: ${admin.email}\n`;
              adminMessage += `Phone: ${admin.phoneNumber}\n\n`;
          });

          await bot.sendMessage(msg.chat.id, adminMessage);
      } else {
         
          await bot.sendMessage(msg.chat.id, "Sorry, we couldn't fetch the contacts at the moment.");
      }
  } catch (error) {
      console.error('Error handling /contacts command:', error);
      await bot.sendMessage(msg.chat.id, "Something went wrong while fetching the contacts.");
  }
});
// Comando para obtener y mostrar los productos
bot.on("/products", async (msg) => {
    try {
        const products = await getProducts();
        
        if (products) {
            let productMessage = 'Here are our products:\n\n';
            
            products.forEach((product, index) => {
                productMessage += `${index + 1}. ${product.name} (${product.category.name}) - $${product.price}\n`;
                productMessage += `${product.description}\n\n`;
            });

            await bot.sendMessage(msg.chat.id, productMessage);
        } else {
           
            await bot.sendMessage(msg.chat.id, "Sorry, we couldn't fetch the products at the moment.");
        }
    } catch (error) {
        console.error('Error handling /products command:', error);
        await bot.sendMessage(msg.chat.id, "Something went wrong while fetching the products.");
    }
});

//Menu de las opciones del ChatBot
bot.on(["/start", "/help"], async (msg) => {
    try {
        await bot.sendMessage(msg.chat.id, `
command1 - /help
command2 - /location
command3 - /schedule
command4 - /stores
command5 -/products
command6 -/contacts
command7 -/categories
command8 -/adduser`);
    } catch (error) {
        console.error('Error', error);
    }
});
//Ubicación de las tiendas 
bot.on(["/location", "/stores"], async (msg) => {
    try {
        await bot.sendMessage(msg.chat.id, `We have 3 stores:
1. Barva: 300 meters west of the central park
2. Tibás: Inside the facilities of the Tibas mall, local 5
3. Moravia: Next to the Liceo de Moravia`);
    } catch (error) {
        console.error('Error', error);
    }
});
//Horario de atención
bot.on(["/schedule"], async (msg) => {
    try {
        await bot.sendMessage(msg.chat.id, `We open every day from 8am to 6pm`);
    } catch (error) {
        console.error('Error', error);
    }
});

//Post de un nuevo usuario 
// Función para agregar un usuario(cliente) a través de la API
const addUser = async (userData) => {
  try {
      const response = await axios.post(
          'https://sweet-dreams-app-v01-526d0a7b9b94.herokuapp.com/v1/users',
          userData, 
          {
              headers: {
                  'Authorization': `Bearer ${CONSTANTS.BEARER_TOKEN}`,
                  'Content-Type': 'application/json'
              }
          }
      );

      return response.data; 
  } catch (error) {
      console.error('Error adding user:', error.response?.data || error.message);
      return null;
  }
};


bot.on('/adduser', async (msg) => {
  const chatId = msg.chat.id;

  
  const input = msg.text.split(' ').slice(1).join(' '); 
  const [firstName, lastName, email, phoneNumber, password] = input.split(':');

  if (!firstName || !lastName || !email || !phoneNumber || !password) {
      await bot.sendMessage(chatId, 'Please provide user details in the format: `/adduser firstName:lastName:email:phoneNumber:password`');
      return;
  }

  
  const currentDate = new Date().toISOString(); 
  const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      password: password.trim(),
      createDate: currentDate,
      enabled: true,
      tokenExpired: false,
      roleList: [
          {
              id: 2,
              name: "UserC",
              privileges: []
          }
      ],
      orders: []
  };

  try {
      const result = await addUser(userData);

      if (result) {
          await bot.sendMessage(chatId, `User "${firstName} ${lastName}" added successfully!You can enter through the following link: ....`);
      } else {
          await bot.sendMessage(chatId, 'Failed to add user. Please try again later.');
      }
  } catch (error) {
      console.error('Error handling /adduser command:', error);
      await bot.sendMessage(chatId, 'Something went wrong while adding the user.');
  }
});

// Iniciar el bot
bot.start();
