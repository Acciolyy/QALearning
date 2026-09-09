from django.urls import path
from .views import vault_commerce_checkout_view

app_name = 'mini_sites'

urlpatterns = [
    path('vault-commerce/checkout/', vault_commerce_checkout_view, name='vault_commerce_checkout'),
]
