        const plants = [];
        let currentFilter = 'all';

        function toggleAddPlant() {
            const form = document.getElementById('addPlantForm');
            form.classList.toggle('active');
        }

        function showSection(event, section) {
            const items = document.querySelectorAll('.menu-item');
            items.forEach(item => item.classList.remove('active'));
            event.currentTarget.classList.add('active'); // Use currentTarget for consistent behavior
        }

        document.getElementById('plantForm').addEventListener('submit', function (e) {
            e.preventDefault();

            try {
                console.log('Form submitted!');

                // Validate inputs exist
                const nameInput = document.getElementById('plantName');
                const typeInput = document.getElementById('plantType');

                if (!nameInput || !typeInput) {
                    throw new Error('Critical form elements missing');
                }

                const plant = {
                    id: Date.now(),
                    name: nameInput.value,
                    type: typeInput.value,
                    location: document.getElementById('location')?.value || 'Not specified',
                    waterFreq: parseInt(document.getElementById('waterFreq')?.value || 0),
                    fertilizeFreq: parseInt(document.getElementById('fertilizeFreq')?.value || 30),
                    lightReq: document.getElementById('lightReq')?.value || 'Medium',
                    notes: document.getElementById('notes')?.value || '',
                    lastWatered: new Date(),
                    lastFertilized: new Date(),
                    dateAdded: new Date(),
                    health: 'good'
                };

                console.log('Adding plant:', plant);
                plants.push(plant);
                console.log('Total plants:', plants.length);

                this.reset();
                toggleAddPlant();
                renderPlants();
                updateStats(); // Ensure updateStats is called
            } catch (error) {
                console.error('Error adding plant:', error);
                alert('Failed to add plant. Check console for details.');
            }
        });

        function getPlantIcon(type) {
            const icons = {
                'Succulent': '🌵',
                'Tropical': '🌴',
                'Cactus': '🌵',
                'Fern': '🌿',
                'Flowering': '🌸',
                'Herb': '🌱',
                'Foliage': '🍃'
            };
            return icons[type] || '🌿';
        }

        function getDaysUntilWater(plant) {
            const nextWater = new Date(plant.lastWatered.getTime() + plant.waterFreq * 24 * 60 * 60 * 1000);
            return Math.ceil((nextWater - new Date()) / (1000 * 60 * 60 * 24));
        }

        function getWaterStatus(daysUntil) {
            if (daysUntil <= 0) return { class: 'status-urgent', text: 'Water Now!' };
            if (daysUntil <= 2) return { class: 'status-warning', text: `Water in ${daysUntil}d` };
            return { class: 'status-good', text: `Water in ${daysUntil}d` };
        }

        function renderPlants() {
            console.log('Rendering plants. Total:', plants.length);
            const grid = document.getElementById('plantsGrid');

            let filteredPlants = plants;
            if (currentFilter === 'urgent') {
                filteredPlants = plants.filter(p => getDaysUntilWater(p) <= 0);
            } else if (currentFilter === 'healthy') {
                filteredPlants = plants.filter(p => getDaysUntilWater(p) > 2);
            }

            console.log('Filtered plants:', filteredPlants.length);

            if (filteredPlants.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🌱</div>
                        <h3>${plants.length === 0 ? 'No plants yet!' : 'No plants in this category'}</h3>
                        ${plants.length === 0 ? '<p style="margin-top: 10px;">Click "Add Plant" to start your green journey</p>' : ''}
                    </div>
                `;
                return;
            }

            grid.innerHTML = filteredPlants.map(plant => {
                const daysUntil = getDaysUntilWater(plant);
                const status = getWaterStatus(daysUntil);
                const needsWater = daysUntil <= 0;

                return `
                    <div class="plant-card ${needsWater ? 'needs-water' : ''}">
                        <div class="plant-header">
                            <div>
                                <div class="plant-icon">${getPlantIcon(plant.type)}</div>
                                <div class="plant-name">${plant.name}</div>
                                <div class="plant-type">${plant.type} • ${plant.location}</div>
                            </div>
                            <div class="plant-menu">⋮</div>
                        </div>
                        
                        <div class="plant-details">
                            <div class="detail-row">
                                <span class="detail-label">Water Status:</span>
                                <span class="status-badge ${status.class}">${status.text}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Light:</span>
                                <span class="detail-value">${plant.lightReq} Light</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Last Watered:</span>
                                <span class="detail-value">${plant.lastWatered.toLocaleDateString()}</span>
                            </div>
                        </div>
                        
                        <div class="plant-actions">
                            <button class="action-btn action-water" onclick="waterPlant(${plant.id})">
                                💧 Water
                            </button>
                            <button class="action-btn action-fertilize" onclick="fertilizePlant(${plant.id})">
                                🌟 Fertilize
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function waterPlant(id) {
            const plant = plants.find(p => p.id === id);
            if (plant) {
                plant.lastWatered = new Date();
                renderPlants();
                updateStats();
            }
        }

        function fertilizePlant(id) {
            const plant = plants.find(p => p.id === id);
            if (plant) {
                plant.lastFertilized = new Date();
                renderPlants();
            }
        }

        function filterPlants(event, filter) {
            currentFilter = filter;
            const tabs = document.querySelectorAll('.filter-tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            event.currentTarget.classList.add('active');
            renderPlants();
        }

        function updateStats() {
            document.getElementById('totalPlants').textContent = plants.length;
            document.getElementById('needsWater').textContent = plants.filter(p => getDaysUntilWater(p) <= 0).length;
            document.getElementById('healthyPlants').textContent = plants.filter(p => getDaysUntilWater(p) > 2).length;
            document.getElementById('bloomingPlants').textContent = plants.filter(p => p.type === 'Flowering').length;
        }

        // Initialize
        updateStats();
        renderPlants();
