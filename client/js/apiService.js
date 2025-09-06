async function apiGet(endpoint) {
    try {
        const response = await fetch(getFullUrl(endpoint));
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error in GET request:', error);
        throw error;
    }
}

async function apiPost(endpoint, data) {
    try {
        const formData = new URLSearchParams();
        for (const key in data) {
            formData.append(key, data[key]);
        }

        const response = await fetch(getFullUrl(endpoint), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error in POST request:', error);
        throw error;
    }
}