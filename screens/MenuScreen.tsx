import React, { useState } from 'react';
import { View, Button, StyleSheet, Alert, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { PDFDocument } from 'pdf-lib'; 
import mammoth from 'mammoth'; 

export default function MenuScreen() {
  const [conteudoArquivo, setConteudoArquivo] = useState<string | null>(null);
  const [perguntas, setPerguntas] = useState<any[]>([]);

  const carregarArquivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});

      if (result.type === 'success') {
        const { uri } = result;
        const mimeType = result.mimeType || ''; 

        console.log('URI do arquivo:', uri);
        console.log('Tipo do arquivo (MIME):', mimeType);

        // Verificando se é um arquivo aceito
        if (mimeType === 'application/pdf') {
          const pdfConteudo = await lerPDF(uri);
          processarConteudo(pdfConteudo);
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const docxConteudo = await lerDocx(uri);
          processarConteudo(docxConteudo);
        } else if (mimeType === 'text/plain') {
          const txtConteudo = await FileSystem.readAsStringAsync(uri);
          processarConteudo(txtConteudo);
        } else {
          Alert.alert('Erro', 'Formato de arquivo não suportado. Aceitamos apenas PDF, DOCX e TXT.');
        }
      } else {
        Alert.alert('Carregamento cancelado', 'O carregamento do arquivo foi cancelado.');
      }
    } catch (error) {
      Alert.alert('Erro ao carregar arquivo', `Erro: ${error.message}`);
      console.log('Erro:', error);
    }
  };

  const processarConteudo = (conteudo: string) => {
    const perguntasExtraidas = conteudo.split('\n').map((linha) => {
      const [pergunta, alternativas] = linha.split(':');
      const alternativasArray = alternativas ? alternativas.split(';') : [];
      return {
        pergunta: pergunta.trim(),
        alternativas: alternativasArray.map((alt) => alt.trim()),
        correta: 0, 
      };
    });

    setPerguntas(perguntasExtraidas);
    Alert.alert('Sucesso', 'Perguntas extraídas com sucesso!');
  };

  const lerPDF = async (uri: string) => {
    const file = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const pdfDoc = await PDFDocument.load(file);
    const pages = pdfDoc.getPages();
    let text = '';
    for (let page of pages) {
      const content = await page.getTextContent();
      text += content;
    }
    return text;
  };

  const lerDocx = async (uri: string) => {
    const file = await FileSystem.readAsStringAsync(uri);
    const { value } = await mammoth.extractRawText({ path: uri });
    return value;
  };

  const gerarQuestionario = () => {
    if (perguntas.length === 0) {
      Alert.alert('Erro', 'Nenhuma pergunta foi carregada');
    } else {
      Alert.alert('Sucesso', 'Gerando questionário a partir das perguntas carregadas!');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Carregar Arquivo" onPress={carregarArquivo} />
      <View style={styles.spacing} />
      <Button title="Gerar Questionário" onPress={gerarQuestionario} />
      {perguntas.length > 0 && <Text style={styles.textoCarregado}>Perguntas carregadas: {perguntas.length}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacing: {
    height: 20,
  },
  textoCarregado: {
    marginTop: 20,
    color: 'green',
    fontWeight: 'bold',
  },
});
