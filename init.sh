kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.0.5/deploy/static/provider/cloud/deploy.yaml
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=TEST