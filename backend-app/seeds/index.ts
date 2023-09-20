function seed() {
    try {
        // Connect to the database
        // await connectDatabase();

        // // Run individual seed scripts
        // await seedUsers();
        // await seedProducts();

        // // Disconnect from the database
        // await disconnectDatabase();

        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Error seeding the database:', error);
    }
}

seed();
