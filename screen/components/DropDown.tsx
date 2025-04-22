import { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const jobCategories = [
    {
      title: 'Building & Construction',
      items: ['New Builds', 'Renovations', 'Extensions', 'Retaining Walls', 'Decking', 'Pergolas', 'Foundations'],
    },
    {
      title: 'Plumbing',
      items: ['General Plumbing', 'Drainlaying', 'Gasfitting', 'Hot Water Cylinder', 'Bathroom Renovation', 'Stormwater Management'],
    },
    {
      title: 'Electrical',
      items: ['General Electrical', 'Lighting Installation', 'Power Points', 'Switchboard Upgrade', 'EV Charger Installation', 'Solar Panel Installation'],
    },
    {
      title: 'Roofing',
      items: ['Roof Replacement', 'Roof Repairs', 'Gutter Installation', 'Fascia & Soffit', 'Spouting'],
    },
    {
      title: 'Painting & Decorating',
      items: ['Interior Painting', 'Exterior Painting', 'Plastering', 'Wallpapering', 'Spray Painting'],
    },
    {
      title: 'Carpentry & Joinery',
      items: ['Framing', 'Door & Window Installation', 'Cabinet Making', 'Skirting & Architraves'],
    },
    {
      title: 'Tiling',
      items: ['Wall Tiling', 'Floor Tiling', 'Waterproofing', 'Grouting'],
    },
    {
      title: 'Flooring',
      items: ['Timber Flooring', 'Laminate Flooring', 'Carpet Installation', 'Floor Sanding & Polishing'],
    },
    {
      title: 'Landscaping',
      items: ['Garden Design', 'Fencing', 'Paving', 'Turfing', 'Retaining'],
    },
    {
      title: 'Concrete & Paving',
      items: ['Driveways', 'Pathways', 'Concrete Cutting', 'Polished Concrete'],
    },
    {
      title: 'Earthworks & Excavation',
      items: ['Site Clearing', 'Foundation Prep', 'Trenching', 'Soil Removal'],
    },
    {
      title: 'Scaffolding & Access',
      items: ['Residential Scaffolding', 'Edge Protection', 'Mobile Towers'],
    },
    {
      title: 'Heating & Cooling',
      items: ['Heat Pumps', 'Ventilation', 'Underfloor Heating', 'Air Conditioning'],
    },
    {
      title: 'Windows & Glazing',
      items: ['Double Glazing', 'Window Replacement', 'Skylights'],
    },
    {
      title: 'Insulation',
      items: ['Ceiling Insulation', 'Wall Insulation', 'Underfloor Insulation'],
    },
    {
      title: 'Security & Smart Home',
      items: ['CCTV Installation', 'Alarm Systems', 'Smart Lighting', 'Intercom Systems'],
    },
    {
      title: 'Cladding & Exterior',
      items: ['Weatherboard', 'Brick Veneer', 'Metal Cladding', 'Plaster Cladding (e.g. Sto, Rockcote)'],
    },
    {
      title: 'Demolition & Rubbish Removal',
      items: ['Internal Strip-out', 'Full Demolition', 'Skip Bin Hire', 'Asbestos Removal'],
    },
    {
      title: 'Plasterboard & Stopping',
      items: ['GIB Installation', 'GIB Stopping', 'Level 4/5 Finish'],
    },
    {
      title: 'Cleaning & Maintenance',
      items: ['Builders Clean', 'Gutter Cleaning', 'Waterblasting', 'Roof Cleaning'],
    },
  ];
  
  const JobCategoryList = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
    const filteredCategories = jobCategories.map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.toLowerCase().includes(searchText.toLowerCase())
      ),
    })).filter(cat => cat.items.length > 0);
  
    const handleSelect = (item: string) => {
      setSelectedItem(item);
      setModalVisible(false);
    };
  
    return (
      <View style={styles.inputCard}>
        <Text style={styles.label}>Job Category</Text>
  
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: selectedItem ? '#000' : '#aaa' }}>
            {selectedItem || 'Select a job category'}
          </Text>
        </TouchableOpacity>
  
        <Modal visible={modalVisible} animationType="slide">
          <View style={styles.modalContent}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchText}
              onChangeText={setSearchText}
            />
            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item.title}
              renderItem={({ item }) => (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.categoryTitle}>{item.title}</Text>
                  {item.items.map((subItem, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handleSelect(subItem)}
                    >
                      <Text style={styles.item}>• {subItem}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: '#fff' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    inputCard: {
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 12,
      backgroundColor: '#fff',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    label: {
      fontWeight: 'bold',
      fontSize: 14,
      color: '#333',
      marginBottom: 6,
    },
    dropdownButton: {
      padding: 12,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      backgroundColor: '#f9f9f9',
    },
    modalContent: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
    },
    searchInput: {
      height: 40,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      paddingHorizontal: 10,
      marginBottom: 12,
    },
    categoryTitle: {
      fontWeight: '600',
      fontSize: 14,
      marginTop: 8,
      marginBottom: 4,
      color: '#555',
    },
    item: {
      marginLeft: 12,
      fontSize: 13,
      paddingVertical: 4,
      color: '#444',
    },
    closeButton: {
      marginTop: 16,
      padding: 12,
      backgroundColor: '#007AFF',
      alignItems: 'center',
      borderRadius: 8,
    },
  });

  export default JobCategoryList;
  