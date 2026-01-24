# AWS Amplify Deploy Action

Español | [English](README.md)

GitHub Action compuesta para desplegar artefactos estáticos (.zip) directamente a AWS Amplify utilizando AWS CLI, sin necesidad de gestionar un bucket S3 intermedio.

## Prerrequisitos

Esta acción requiere que las credenciales de AWS estén configuradas en el entorno antes de ejecutarse. Se recomienda usar `aws-actions/configure-aws-credentials`.

## Uso

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4

  # 1. Configurar credenciales AWS
  - name: Configure AWS Credentials
    uses: aws-actions/configure-aws-credentials@v4
    with:
      aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
      aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      aws-region: us-east-2

  # 2. Generar el artefacto (Importante: entrar al directorio antes de zipear)
  - name: Create Artifact
    run: cd public && zip -r ../dist.zip .

  # 3. Desplegar
  - name: Deploy to Amplify
    uses: tu-usuario/amplify-deploy-action@v1
    with:
      app-id: ${{ secrets.AMPLIFY_APP_ID }}
      branch: 'main'
      zip-path: './dist.zip'
```

## Inputs

| Input    |                      Descripción                      | Requerido | Default |
| -------- | :---------------------------------------------------: | :-------: | :-----: |
| app-id   | El App ID de Amplify (visible en la consola AWS).     |    Sí     |    -    |
| zip-path | Ruta relativa o absoluta al archivo .zip a desplegar. |    Sí     |    -    |
| branch   | Nombre de la rama en Amplify donde se desplegará.     |    No     |  main   |

## Política IAM Mínima

El usuario IAM utilizado requiere los siguientes permisos. Si usas Permissions Boundaries, asegúrate de que el límite permita estas acciones y recursos.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "amplify:CreateDeployment",
        "amplify:StartDeployment",
        "amplify:GetApp",
        "amplify:GetBranch"
      ],
      "Resource": ["arn:aws:amplify:REGION:ACCOUNT_ID:apps/APP_ID/*"]
    }
  ]
}
```

## Notas sobre el ZIP

Para evitar que la aplicación se sirva en una subcarpeta (ej: /public/index.html), asegúrate de comprimir el contenido del directorio de compilación, no el directorio en sí.

Incorrecto: `zip -r deploy.zip ./public/`

Correcto: `cd public && zip -r ../deploy.zip .`

## Autor

[fmarinoa](https://github.com/fmarinoa)
