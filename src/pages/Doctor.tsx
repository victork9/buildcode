
import React, { useState, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Modal,
  Alert,
  TextInput,
  ToastAndroid
} from 'react-native';
import closeRow from '../componets/closeRow'
import Entypo from 'react-native-vector-icons/Entypo'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { SwipeListView } from 'react-native-swipe-list-view';
import styles from '../styles/styles'
import api from '../services/api'

interface ListaDatas {
  key: number,
  name:string,
  Crm: string,
  CrmUf: string
}

export default function Doctor() {

  const [listData, setListData] = useState<ListaDatas[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [nameDoc, setnameDoc] = useState("");
  const [crmDoc, setcrmDoc] = useState("");
  const [stateDoc, setstateDoc] = useState("");
  const [identificador, setIdentificador] = useState(0);
  const [modeBtn, setmodeBtn] = useState(false);


  async function listDoctor() {
    try {
      const response = await api.get('/ListDoctors')
      setListData(response.data)
    } catch (error) {
      console.log("Falha conexão")
    }

  }

  useEffect(() => {
    listDoctor()
  }, [])

  async function infosDoctor() {
    if (nameDoc.length < 2) {
      ToastAndroid.show("Por favor, digite um nome Válido", ToastAndroid.LONG)
    } else if (crmDoc.length  <2 ) {
      ToastAndroid.show("Por favor, digite um CRM Válido", ToastAndroid.LONG)
    }
    else if (stateDoc.length < 2) {
      ToastAndroid.show("Por favor, digite um estado Válido", ToastAndroid.LONG)
    } else {

      try {
        const typeEnv = modeBtn == true ? 'upInfoDoctor' : 'cadDoctor'
        const response = await api.post(`/${typeEnv}/`, {
          nameDoc,
          crmDoc,
          stateDoc,
          identificador: identificador == 0 ? identificador : null
        })
        if (modeBtn == false && response.data == 'Existe') {
          Alert.alert("Atenção", "Médico já possue cadastro")
        } else {
          if (modeBtn == true) {
            await updateInfoOff()
          }
          listDoctor()
          setIsVisible(false)
          setcrmDoc("")
          setstateDoc(null)
          setnameDoc('')
          setmodeBtn(false)
          setIdentificador(0)
        }
      } catch (error) {
        Alert.alert("Falha na conexão")
      }
    }
  }
  //update dos valores sem ter que fazer uma nova requisição
  function updateInfoOff() {
    const updateInfoOff = listData.filter(item => item.key === identificador)

    updateInfoOff[0].Crm = crmDoc
    updateInfoOff[0].name = nameDoc
    updateInfoOff[0].CrmUf = `${crmDoc}-${stateDoc}`
    return;
  }

  function loadInfo(rowMap, rowKey) {
    setmodeBtn(true)
    const keyData = listData.filter(item => item.key === rowKey)
    const state = keyData[0].CrmUf.split('-')
    setcrmDoc(keyData[0].Crm)
    setIdentificador(keyData[0].key)
    setstateDoc(state[1])
    setnameDoc(keyData[0].name)
    setIsVisible(true)
    closeRow(rowMap, rowKey)
  }



  const deleteRow = async (rowMap, rowKey) => {
    console.log(rowKey)
    try {
      const response = await api.post('/deleteDoctor/', {
        identificador: rowKey
      })
      if (response.data == "existe Registro") {
        Alert.alert("Atenção", "Não é possível excluir o registro, pois existe pacientes vinculados a este médico")
        closeRow(rowMap, rowKey);
      } else {
        closeRow(rowMap, rowKey);
        const newData = [...listData];
        const prevIndex = listData.findIndex(item => item.key === rowKey);
        newData.splice(prevIndex, 1);
        setListData(newData);
      }
    } catch (error) {
      console.log(error)
    }

  };

  // const onRowDidOpen = rowKey => {
  //   console.log('This row opened', rowKey);
  // };

  const renderItem = data => (
    <TouchableHighlight
      onPress={() => { }}
      style={styles.rowFront}
      underlayColor={'#fff'}
    >
      <View style={{ marginLeft: 15 }}>
        <Text style={{ fontSize: 17 }}>Nome: {data.item.name}</Text>
        <Text style={{ fontSize: 17 }}>Crm: {data.item.CrmUf}</Text>
        <View style={{ justifyContent: 'center', alignSelf: "flex-end", position: 'absolute' }}>
          <MaterialIcons name="keyboard-arrow-left" size={50} color="#309D9E" />
        </View>
      </View>

    </TouchableHighlight>
  );

  const renderHiddenItem = (data, rowMap) => {

    return (
      <View style={styles.rowBack}>
        <TouchableOpacity
          style={[styles.backRightBtn, styles.backRightBtnLeft]}
          onPress={() => loadInfo(rowMap, data.item.key)}
        >
          <Text style={styles.backTextWhite}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.backRightBtn, styles.backRightBtnRight]}
          onPress={() => {
            Alert.alert(`Excluir`,
              `Deseja Realmente excluir o registro ?`,

              [
                { text: 'Cancelar', onPress: () => console.log('Cancelar') },
                { text: 'OK', onPress: () => deleteRow(rowMap, data.item.key) }

              ],
              { cancelable: false });

          }}
        >
          <Text style={styles.backTextWhite}>Deletar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Text style={styles.textTop}>Lista De Médicos</Text>

      <Modal
        animationType="slide"
        transparent={true}

        visible={isVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Cadastro de Médicos</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ textAlignVertical: 'center', fontSize: 16 }}>Nome :</Text>
              <TextInput style={styles.txtInput}
                placeholder={"Ex: João da silva"}
                value={nameDoc}
                onChangeText={(text) => setnameDoc(text)}
                multiline={true}
              />

            </View>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Text style={{ textAlignVertical: 'center', fontSize: 16 }}>Crm :</Text>
              <TextInput style={styles.txtInput}
                value={crmDoc}
                keyboardType={'numeric'}
                maxLength={13}
                placeholder={"Ex: 12546"}
                onChangeText={setcrmDoc}
                multiline={true}
              />

            </View>
            <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 20 }}>
              <Text style={{ textAlignVertical: 'center', fontSize: 16, width: '50%' }}>Estado de atuação :</Text>
              <TextInput style={[styles.txtInput, {
                width: '30%',

              }]}
                value={stateDoc}
                autoCapitalize={'characters'}
                maxLength={2}
                placeholder={"Ex: SP"}
                onChangeText={setstateDoc}
                multiline={true}
              />

            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <TouchableHighlight
                style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                onPress={() => {
                  Alert.alert(`Confirmar ${modeBtn == true ? 'Alteração' : 'Cadastro'} `,
                    `Deseja Confirmar ${modeBtn == true ? 'a alteração' : 'o cadastro'} ?`,

                    [
                      { text: 'Cancelar', onPress: () => console.log('Cancelar') },
                      { text: 'OK', onPress: () => infosDoctor() }

                    ],
                    { cancelable: false });

                }}
              >
                <Text style={styles.textStyle}>{modeBtn == true ? "SALVAR" : "CADASTRAR"}</Text>
              </TouchableHighlight>

              <TouchableHighlight
                style={{ ...styles.openButton, backgroundColor: "#2196F3", width: 90, }}
                onPress={() => {
                  setIsVisible(false)
                  setcrmDoc("")
                  setstateDoc("")
                  setnameDoc("")
                  setmodeBtn(false)
                }}>
                <Text style={styles.textStyle}>FECHAR</Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </Modal>


      <View style={styles.containerSwipe}>
        <SwipeListView
          disableRightSwipe={true}
          data={listData}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          leftOpenValue={75}
          rightOpenValue={-190}
          previewRowKey={'0'}
          previewOpenValue={-10}
          previewOpenDelay={5000}
        // onRowDidOpen={onRowDidOpen}
        />
      </View>
      <View style={styles.btnfooter}>
        <TouchableOpacity
          onPress={() => setIsVisible(!isVisible)}
          style={styles.btnadd}
        >
          <Entypo name="circle-with-plus" size={50} color="#309D9E" />
        </TouchableOpacity>
      </View>
    </>
  );
}


