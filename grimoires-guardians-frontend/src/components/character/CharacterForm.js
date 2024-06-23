import React, { useState, useEffect, useContext } from 'react';
import { MenuItem, Select, InputBase, IconButton, Button, Box, Typography, Checkbox, ListItemText, Grid, Paper } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceD20 } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { ChatContext } from './ChatContext';

const ITEM_TYPES = ['Arme', 'Armure', 'Accessoire', 'Autre'];

const CharacterForm = ({ file, onSave, gameId, onClose, setTabIndex }) => {
    const [name, setName] = useState(file.name || '');
    const [classType, setClassType] = useState(file.data?.classType || '');
    const [species, setSpecies] = useState(file.data?.species || '');
    const [background, setBackground] = useState(file.data?.background || '');
    const [actionPoints, setActionPoints] = useState(file.data?.actionPoints || '');
    const [hitPoints, setHitPoints] = useState(file.data?.hitPoints || '');
    const [wounds, setWounds] = useState(file.data?.wounds || []);
    const [address, setAddress] = useState(file.data?.address || '');
    const [spirit, setSpirit] = useState(file.data?.spirit || '');
    const [power, setPower] = useState(file.data?.power || '');
    const [defense, setDefense] = useState(file.data?.defense || '');
    const [damage, setDamage] = useState('');
    const [equipment, setEquipment] = useState(file.data?.equipment || []);
    const [level, setLevel] = useState(file.data?.niveau || '');
    const [editName, setEditName] = useState(false);
    const [currentSection, setCurrentSection] = useState('stats');
    const [profils, setProfils] = useState([]);
    const [races, setRaces] = useState([]);
    const [raceTraits, setRaceTraits] = useState({ adresse: 0, esprit: 0, puissance: 0 });
    const [profileTraits, setProfileTraits] = useState({ adresse: 0, esprit: 0, puissance: 0 });
    const [totalAddress, setTotalAddress] = useState(0);
    const [totalSpirit, setTotalSpirit] = useState(0);
    const [totalPower, setTotalPower] = useState(0);
    const [items, setItems] = useState([]);
    const [weaponType, setWeaponType] = useState('');
    const [paths, setPaths] = useState([]);
    const [capacities, setCapacities] = useState({});
    const [image, setImage] = useState(file.data?.image || '');
    const [fileType] = useState('caracteres');
    const [heroId, setHeroId] = useState(file.id || '');
    const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
    const { handleSendMessage } = useContext(ChatContext);

    useEffect(() => {

        const fetchHeroImage = async () => {
            const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;

            try {
                const response = await api.get(`/api/heroes/${file.id}/image`);
                if (response.data.url) {
                    setImage(IMAGE_BASE_URL + response.data.url);
                } else {
                    setImage(IMAGE_BASE_URL + '/caracteres/default.webp'); // Set a default image if there's no specific image for the hero
                }
            } catch (error) {
                console.error('Failed to fetch hero image', error);
                setImage(IMAGE_BASE_URL + '/caracteres/default.webp'); // Set a default image if there's an error
            }
        };

        fetchHeroImage();

        setName(file.data?.name || '');
        setClassType(file.data?.classType || '');
        setSpecies(file.data?.species || '');
        setBackground(file.data?.background || '');
        setLevel(file.data?.level || '');
        setActionPoints(file.data?.actionPoints || '');
        setHitPoints(file.data?.hitPoints || '');
        setWounds(file.data?.wounds || []);
        setAddress(file.data?.address || '');
        setSpirit(file.data?.spirit || '');
        setPower(file.data?.power || '');
        setDefense(file.data?.defense || '');
        setEquipment(file.data?.equipment || []);
        setHeroId(file.id || '');
    }, [file]);

    useEffect(() => {
        const fetchProfils = async () => {
            try {
                const response = await api.get(`/api/game/${gameId}/items/profiles`);
                setProfils(response.data.profiles.map(item => {
                    const data = JSON.parse(item.data);
                    return data;
                }));
            } catch (error) {
                console.error('Failed to fetch profiles', error);
            }
        };

        const fetchRaces = async () => {
            try {
                const response = await api.get(`/api/game/${gameId}/items/peuples`);
                setRaces(response.data.profiles.map(item => {
                    const data = JSON.parse(item.data);
                    return data;
                }));
            } catch (error) {
                console.error('Failed to fetch races', error);
            }
        };

        const fetchItems = async () => {
            try {
                const response = await api.get(`/api/game/${gameId}/equipements`);
                setItems(response.data.items.map(item => {
                    const data = JSON.parse(item.data);
                    return data;
                }).filter(item => ITEM_TYPES.includes(item.fileType)));
            } catch (error) {
                console.error('Failed to fetch items', error);
            }
        };

        fetchProfils();
        fetchRaces();
        fetchItems();
    }, [gameId]);

    useEffect(() => {
        const selectedProfile = profils.find(profile => profile.name === classType);
        const selectedRace = races.find(race => race.name === species);

        if (selectedProfile) {
            setProfileTraits(selectedProfile.traits);
        }
        if (selectedRace) {
            setRaceTraits(selectedRace.traits);
        }

        setTotalAddress(+address + +raceTraits.adresse + +profileTraits.adresse);
        setTotalSpirit(+spirit + +raceTraits.esprit + +profileTraits.esprit);
        setTotalPower(+power + +raceTraits.puissance + +profileTraits.puissance);

        if (selectedProfile && selectedProfile.paths) {
            const paths = selectedProfile.paths.map(p => p.path);
            setPaths(paths);
        }
    }, [classType, species, address, spirit, power, profils, races, raceTraits, profileTraits]);

    useEffect(() => {
        const fetchCapacities = async () => {
            try {
                const response = await api.get(`/api/game/${gameId}/profiles/${classType}/paths/capacities`);
                setCapacities(response.data.capacities);
            } catch (error) {
                console.error('Failed to fetch capacities', error);
            }
        };

        if (paths.length > 0) {
            fetchCapacities();
        }
    }, [paths, classType, gameId]);

    useEffect(() => {
        const selectedWeapon = items.find(item => item.fileType === 'Arme' && equipment.includes(item.name));
        if (selectedWeapon) {
            setWeaponType(selectedWeapon.weaponType);
            setDamage(selectedWeapon.damage);
        } else {
            setWeaponType('');
            setDamage('');
        }
    }, [equipment, items]);

    useEffect(() => {
        const armors = items.filter(item => item.fileType === 'Armure' && equipment.includes(item.name));
        const totalDefense = 10 + totalAddress + armors.reduce((acc, armor) => acc + (parseInt(armor.defense) || 0), 0);
        setDefense(totalDefense);
    }, [equipment, items, totalAddress]);

    const handleSave = () => {
        const updatedFile = {
            ...file,
            name,
            data: {
                ...file.data,
                classType,
                species,
                background,
                level,
                actionPoints,
                hitPoints,
                wounds,
                address,
                spirit,
                power,
                defense,
                damage,
                equipment,
                image
            }
        };
        onSave(updatedFile);
    };

    const handleWoundsChange = (index) => {
        const newWounds = [...wounds];
        newWounds[index] = !newWounds[index];
        setWounds(newWounds);
    };

    const rollDice = (value, traitType) => {
        const message = `/r 1d20 + ${value}`;
        handleSendMessage(gameId, message, name, traitType);
        onClose();
        setTabIndex(0);
    };

    const handleAttack = () => {
        let attackRollMessage;
        if (weaponType === 'cac') {
            attackRollMessage = `/r 1d20 + ${totalPower}`;
        } else if (weaponType === 'dist') {
            attackRollMessage = `/r 1d20 + ${totalAddress}`;
        } else if (weaponType === 'magic') {
            attackRollMessage = `/r 1d20 + ${totalSpirit}`;
        } else {
            attackRollMessage = `/r 1d20`;
        }

        let damageRollMessage;
        if (weaponType === 'cac') {
            damageRollMessage = `/r ${damage} + ${totalPower}`;
        } else if (weaponType === 'magic') {
            damageRollMessage = `/r ${damage} + ${totalSpirit}`;
        } else {
            damageRollMessage = `/r ${damage}`;
        }

        handleSendMessage(gameId, attackRollMessage, name, 'attaque');
        handleSendMessage(gameId, damageRollMessage, name, 'dégâts');

        onClose();
        setTabIndex(0);
    };


    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('type', fileType);
            formData.append('id', heroId);
            try {
                const response = await api.post(`/api/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setImage(IMAGE_BASE_URL + response.data.url);
            } catch (error) {
                console.error('Failed to upload image', error);
            }
        }
    };
    const renderStatsSection = () => (
        <Grid container spacing={3}>
            <Grid item xs={4}>
                <div className="flex-1">
                    <label htmlFor="image-upload" className="w-full h-80 border border-red-600 rounded space-y-2 mb-4 cursor-pointer relative flex items-center justify-center">
                        <div
                            style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center', width: '100%', height: '20rem' }}
                            className={`w-full h-full ${image ? 'bg-center bg-cover' : ''}`}
                        ></div>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                        {!image && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                Cliquez pour télécharger une image
                            </div>
                        )}
                    </label>
                </div>

                <div className="p-2 border border-red-600 rounded space-y-2">
                    <label className="block text-gray-700 text-sm font-bold">Équipement</label>
                    <Select
                        multiple
                        value={equipment}
                        onChange={(e) => setEquipment(e.target.value)}
                        renderValue={(selected) => (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {selected.map((value) => (
                                    <span key={value}>{value}</span>
                                ))}
                            </div>
                        )}
                        fullWidth
                    >
                        {items.map((item) => (
                            <MenuItem key={item.name} value={item.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Checkbox checked={equipment.indexOf(item.name) > -1} />
                                <ListItemText primary={item.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </div>
            </Grid>
            <Grid item xs={4}>
                <div className="relative flex items-center space-x-2 p-2 border border-red-600 rounded space-y-2">
                    <label
                        className={`text-gray-700 text-lg font-bold cursor-pointer ${editName ? 'hidden' : ''}`}
                        onClick={() => setEditName(true)}
                    >
                        Nom :
                    </label>
                    <InputBase
                        type="text"
                        className={`p-2 ${editName ? '' : 'hidden'}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => setEditName(false)}
                        autoFocus={editName}
                        style={{ color: '#dc2626', border: 'none', outline: 'none', backgroundColor: 'transparent', fontWeight: 'bold' }}
                    />
                </div>

                <div className="flex items-center space-x-2 p-2 border border-red-600 rounded space-y-2">
                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold text-red-600">Profil</label>
                        <Select
                            className="w-full p-2"
                            value={classType}
                            onChange={(e) => setClassType(e.target.value)}
                            size="small"
                        >
                            {profils.map((profil) => (
                                <MenuItem key={profil.id} value={profil.name}>
                                    {profil.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </div>
                    <div className="text-gray-700 text-sm font-bold ">-</div>
                    <div className="flex-1 " style={{ marginTop: 0 }}>
                        <label className="block text-gray-700 text-sm font-bold text-red-600">Espèce</label>
                        <Select
                            className="w-full p-2"
                            value={species}
                            onChange={(e) => setSpecies(e.target.value)}
                            size="small"
                        >
                            {races.map((race) => (
                                <MenuItem key={race.id} value={race.name}>
                                    {race.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </div>
                </div>


                <div className="p-2 border border-red-600 rounded space-y-2">
                    <label className="text-red-600 block text-gray-700 text-sm font-bold">Background</label>
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded h-64"
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                    ></textarea>
                </div>
            </Grid>
            <Grid item xs={4}>
                <div className="flex items-center space-x-2">
                    <div className="text-xl font-bold text-red-600">Niveau</div>
                    <InputBase
                        type="number"
                        value={level}
                        onChange={(e) => setLevel(Math.max(1, e.target.value))}
                        inputProps={{ 'aria-label': 'niveau', min: 1, max: 20 }}
                        style={{
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            fontWeight: 'bold',
                            color: '#dc2626',
                            width: '50px'
                        }}
                    />
                </div>
                <div className="p-2 border border-red-600 rounded space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="block text-gray-700 text-sm font-bold">Points d'action :</label>
                        <span
                            style={{
                                fontWeight: 'bold',
                                color: '#dc2626',
                            }}
                        >
                            {2 + totalSpirit}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="block text-gray-700 text-sm font-bold">Points de vie :</label>
                        <span
                            style={{
                                fontWeight: 'bold',
                                color: '#dc2626',
                            }}
                        >
                            {10 + (2 * totalPower)}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="block text-gray-700 text-sm font-bold">Blessures :</div>
                        {[0, 1, 2, 3, 4].map(index => (
                            <input
                                key={index}
                                type="checkbox"
                                checked={wounds[index] || false}
                                onChange={() => handleWoundsChange(index)}
                                className="w-4 h-4"
                            />
                        ))}
                    </div>
                </div>
                <div className="p-2 border border-red-600 rounded space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="block text-gray-700 text-sm font-bold">Adresse :</div>
                        <InputBase
                            type="number"
                            value={totalAddress}
                            onChange={(e) => setAddress(e.target.value)}
                            inputProps={{ 'aria-label': 'address', min: 0 }}
                            style={{
                                border: 'none',
                                outline: 'none',
                                backgroundColor: 'transparent',
                                fontWeight: 'bold',
                                color: '#dc2626',
                                width: '50px'
                            }}
                        />
                        <IconButton onClick={() => rollDice(totalAddress, 'adresse')}>
                            <FontAwesomeIcon icon={faDiceD20} className="text-red-600" />
                        </IconButton>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="block text-gray-700 text-sm font-bold">Esprit :</div>
                        <InputBase
                            type="number"
                            value={totalSpirit}
                            onChange={(e) => setSpirit(e.target.value)}
                            inputProps={{ 'aria-label': 'spirit', min: 0 }}
                            style={{
                                border: 'none',
                                outline: 'none',
                                backgroundColor: 'transparent',
                                fontWeight: 'bold',
                                color: '#dc2626',
                                width: '50px'
                            }}
                        />
                        <IconButton onClick={() => rollDice(totalSpirit, 'esprit')}>
                            <FontAwesomeIcon icon={faDiceD20} className="text-red-600" />
                        </IconButton>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="block text-gray-700 text-sm font-bold">Puissance :</div>
                        <InputBase
                            type="number"
                            value={totalPower}
                            onChange={(e) => setPower(e.target.value)}
                            inputProps={{ 'aria-label': 'power', min: 0 }}
                            style={{
                                border: 'none',
                                outline: 'none',
                                backgroundColor: 'transparent',
                                fontWeight: 'bold',
                                color: '#dc2626',
                                width: '50px'
                            }}
                        />
                        <IconButton onClick={() => rollDice(totalPower, 'puissance')}>
                            <FontAwesomeIcon icon={faDiceD20} className="text-red-600" />
                        </IconButton>
                    </div>
                </div>
                <div className="p-2 border border-red-600 rounded space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="block text-gray-700 text-sm font-bold">Défense :</div>
                        <span
                            style={{
                                fontWeight: 'bold',
                                color: '#dc2626',
                            }}
                        >
                            {defense}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="block text-gray-700 text-sm font-bold">Arme :</div>
                        <span
                            style={{
                                border: 'none',
                                outline: 'none',
                                backgroundColor: 'transparent',
                                fontWeight: 'bold',
                                color: '#dc2626',
                                width: '50px',
                                fontSize: '0.74rem'
                            }}
                        >
                            {`1d20 + ${weaponType === 'cac' ? totalPower : weaponType === 'dist' ? totalAddress : weaponType === 'magic' ? totalSpirit : ''}`}
                        </span>
                        <IconButton onClick={handleAttack}>
                            <FontAwesomeIcon icon={faDiceD20} className="text-red-600" />
                        </IconButton>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="block text-gray-700 text-sm font-bold">Dégâts :</div>
                        <span
                            style={{
                                fontWeight: 'bold',
                                color: '#dc2626',
                                fontSize: '0.74rem'
                            }}
                        >
                            {weaponType === 'dist' ? damage : weaponType === 'cac' ? `${damage} + ${totalPower}` : weaponType === 'magic' ? `${damage} + ${totalSpirit}` : damage}
                        </span>
                    </div>
                </div>
            </Grid>
        </Grid>
    );

    const renderVoiesSection = () => (
        <Grid container spacing={3}>
            {paths.map((path, index) => (
                <Grid item xs={4} key={index}>
                    <Paper className="p-4 border border-red-600 rounded space-y-2">
                        <Typography variant="h6" className="text-red-600">{path}</Typography>
                        {capacities[path]?.map((capacity, index) => (
                            <div key={index} className="p-2 border border-gray-300 rounded">
                                <Typography variant="body1" className="text-gray-700">{capacity.name}</Typography>
                                <Typography variant="body2" className="text-gray-500">{capacity.description}</Typography>
                            </div>
                        ))}
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded p-6 mt-10 border border-gray-300">
            <div className="text-center text-3xl font-bold text-red-600 mb-4">Les Légendaires</div>
            <Box display="flex" justifyContent="center" mb={2}>
                <Button
                    variant={currentSection === 'stats' ? 'contained' : 'outlined'}
                    style={{ borderColor: '#dc2626', color: currentSection === 'stats' ? 'white' : '#dc2626', backgroundColor: currentSection === 'stats' ? '#dc2626' : 'transparent' }}
                    onClick={() => setCurrentSection('stats')}
                >
                    Stats
                </Button>
                <Button
                    variant={currentSection === 'voies' ? 'contained' : 'outlined'}
                    style={{ borderColor: '#dc2626', color: currentSection === 'voies' ? 'white' : '#dc2626', backgroundColor: currentSection === 'voies' ? '#dc2626' : 'transparent' }}
                    onClick={() => setCurrentSection('voies')}
                >
                    Voies
                </Button>
            </Box>
            {currentSection === 'stats' ? renderStatsSection() : renderVoiesSection()}
            <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
        </div>
    );
};

export default CharacterForm;
