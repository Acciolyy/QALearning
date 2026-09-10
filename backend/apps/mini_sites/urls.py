from django.urls import path
from .views import vault_commerce_checkout_view, source_code_inspection_view

app_name = 'mini_sites'

urlpatterns = [
    path('vault-commerce/checkout/', vault_commerce_checkout_view, name='vault_commerce_checkout'),
    path('source-code/', source_code_inspection_view, name='source_code_inspection'),
]
