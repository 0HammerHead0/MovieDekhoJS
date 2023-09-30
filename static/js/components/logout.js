// logoutMixin.js
export const logoutMixin = {
    methods: {
        async logout() {
            const url = 'http://127.0.0.1:8080/api/logout';
            const requestOptions = {
                method: 'POST',
                mode: 'cors',
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
            };
            try {
                const response = await fetch(url, requestOptions);
                if (response.ok) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('role');
                    this.$router.push({ name: 'login' }); // Redirect to login page after successful logout
                } else {
                    throw new Error('Network response was not ok');
                }
            } catch (error) {
                console.log(error.message);
            }
        },
    }
};