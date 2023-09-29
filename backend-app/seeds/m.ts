import { prompts, checkbox } from '@inquirer/prompts';

// create a question with five checkboxes
const answer = checkbox({
    message: 'Select toppings',
    choices: [
        {
            name: 'Pepperoni',
            checked: true,
        },
        {
            name: 'Ham',
        },
        {
            name: 'Ground Meat',
        },
    ],
    validate: (answer) => {
        if (answer.length < 1) {
            return 'You must choose at least one topping.';
        }
        return true;
    },
});
