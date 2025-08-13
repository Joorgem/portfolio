# Como Editar os Dados do Portfólio

Este diretório contém todos os dados dinâmicos do seu portfólio em formato JSON.

## Estrutura dos Arquivos

- **projects.json** - Seus projetos e trabalhos
- **experiences.json** - Suas experiências profissionais
- **reviews.json** - Depoimentos e avaliações
- **socials.json** - Links para redes sociais

## Como Editar

### 1. Editando Projetos (projects.json)

Para adicionar um novo projeto, copie a estrutura existente:

```json
{
  "id": 7,  // ID único, incremente o último
  "title": "Nome do Projeto",
  "description": "Descrição breve do projeto",
  "subDescription": [
    "Detalhe 1 do que foi feito",
    "Detalhe 2 do que foi implementado",
    "Tecnologias utilizadas"
  ],
  "href": "https://link-do-projeto.com",  // Link externo (opcional)
  "logo": "",  // Logo do projeto (opcional)
  "image": "/assets/projects/nome-imagem.jpg",  // Imagem do projeto
  "tags": [
    {
      "id": 1,
      "name": "React",
      "path": "/assets/logos/react.svg"  // Logo da tecnologia
    }
  ]
}
```

### 2. Editando Experiências (experiences.json)

```json
{
  "title": "Cargo",
  "job": "Empresa ou Tipo de Projeto",
  "date": "2024-2025",
  "contents": [
    "Responsabilidade ou conquista 1",
    "Responsabilidade ou conquista 2",
    "Tecnologias utilizadas"
  ]
}
```

### 3. Editando Reviews (reviews.json)

```json
{
  "name": "Nome da Pessoa",
  "username": "@usuario",
  "body": "Depoimento sobre seu trabalho",
  "img": "https://url-da-foto.com/foto.jpg"
}
```

### 4. Editando Redes Sociais (socials.json)

```json
{
  "name": "Nome da Rede",
  "href": "https://link-do-seu-perfil.com",
  "icon": "/assets/socials/icone.svg"
}
```

## Dicas Importantes

1. **Sempre mantenha a estrutura JSON válida**
   - Use vírgulas entre itens (exceto no último)
   - Mantenha as aspas duplas
   - Não deixe vírgulas sobrando

2. **IDs únicos**
   - Cada projeto deve ter um ID único
   - Incremente baseado no último ID usado

3. **Imagens**
   - Coloque as imagens em `/public/assets/projects/`
   - Use caminhos relativos começando com `/assets/`

4. **Validação**
   - Após editar, teste localmente com `npm run dev`
   - Verifique o console do navegador para erros

5. **Backup**
   - Sempre faça commit das alterações no Git
   - Mantenha um backup antes de grandes mudanças

## Exemplo de Fluxo de Edição

1. Abra o arquivo JSON desejado no VS Code
2. Faça suas alterações seguindo a estrutura
3. Salve o arquivo (Ctrl+S)
4. Teste com `npm run dev`
5. Se tudo estiver ok, faça commit:
   ```bash
   git add .
   git commit -m "Atualização de projetos/experiências"
   ```

## Ferramentas Úteis

- **VS Code** - Editor recomendado
- **JSON Validator** - jsonlint.com para validar JSON
- **Prettier** - Para formatar automaticamente