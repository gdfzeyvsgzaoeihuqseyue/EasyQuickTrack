<template>
  <div class="py-12">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">
          Mentions Légales
        </h1>
        <p class="text-xl text-gray-600">
          Informations légales et conditions d'utilisation de EasyQuickTrack
        </p>
      </div>

      <div class="card p-8 prose prose-lg max-w-none">
        <h2>Informations sur l'éditeur</h2>
        
        <div class="bg-gray-50 p-6 rounded-xl mb-8">
          <p class="mb-2"><strong>Raison sociale :</strong> EasyQuickTrack SAS</p>
          <p class="mb-2"><strong>Adresse :</strong> 123 Rue de la Tech, 75001 Paris, France</p>
          <p class="mb-2"><strong>SIRET :</strong> 123 456 789 00012</p>
          <p class="mb-2"><strong>RCS :</strong> Paris B 123 456 789</p>
          <p class="mb-2"><strong>Capital social :</strong> 50 000 €</p>
          <p class="mb-2"><strong>TVA intracommunautaire :</strong> FR12345678901</p>
          <p class="mb-2"><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
          <p><strong>Email :</strong> legal@EasyQuickTrack.com</p>
        </div>

        <h2>Directeur de publication</h2>
        <p>Jean Dupont, Président de EasyQuickTrack SAS</p>

        <h2>Hébergement</h2>
        <p>Ce site est hébergé par :</p>
        <div class="bg-gray-50 p-4 rounded-xl mb-6">
          <p class="mb-1"><strong>OVHcloud</strong></p>
          <p class="mb-1">2 rue Kellermann</p>
          <p>59100 Roubaix, France</p>
        </div>

        <h2>Conditions d'utilisation</h2>
        
        <h3>1. Objet</h3>
        <p>
          EasyQuickTrack est un service de raccourcissement d'URL qui permet aux utilisateurs de créer des liens courts 
          à partir d'URL longues et de suivre les statistiques de clics associées.
        </p>

        <h3>2. Acceptation des conditions</h3>
        <p>
          L'utilisation du service EasyQuickTrack implique l'acceptation pleine et entière des présentes conditions 
          générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
        </p>

        <h3>3. Utilisation autorisée</h3>
        <p>Vous vous engagez à :</p>
        <ul>
          <li>Utiliser le service conformément à sa destination</li>
          <li>Ne pas raccourcir des liens vers du contenu illégal, malveillant ou inapproprié</li>
          <li>Ne pas utiliser le service pour du spam ou des activités frauduleuses</li>
          <li>Respecter les droits de propriété intellectuelle de tiers</li>
        </ul>

        <h3>4. Propriété intellectuelle</h3>
        <p>
          Tous les éléments du site EasyQuickTrack (design, textes, logos, etc.) sont protégés par le droit d'auteur 
          et appartiennent à EasyQuickTrack SAS ou à ses partenaires.
        </p>

        <h3>5. Responsabilité</h3>
        <p>
          EasyQuickTrack s'efforce de maintenir le service accessible 24h/24 et 7j/7, mais ne peut garantir une 
          disponibilité absolue. La société ne saurait être tenue responsable des dommages directs ou 
          indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le service.
        </p>

        <h3>6. Protection des données</h3>
        <p>
          Les données personnelles collectées font l'objet d'un traitement informatique destiné à l'amélioration 
          de nos services. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de 
          suppression des données vous concernant.
        </p>

        <h3>7. Modification des conditions</h3>
        <p>
          EasyQuickTrack se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs 
          seront informés des modifications par email ou via le site web.
        </p>

        <h3>8. Droit applicable</h3>
        <p>
          Les présentes conditions sont régies par le droit français. En cas de litige, les tribunaux français 
          seront seuls compétents.
        </p>

        <div class="bg-primary-50 p-6 rounded-xl mt-8">
          <h3 class="text-primary-800 mb-4">Contact</h3>
          <p class="text-primary-700 mb-2">
            Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
          </p>
          <ul class="text-primary-700">
            <li>Par email : legal@EasyQuickTrack.com</li>
            <li>Par courrier : EasyQuickTrack SAS, 123 Rue de la Tech, 75001 Paris</li>
            <li>Par téléphone : +33 1 23 45 67 89</li>
          </ul>
        </div>

        <p class="text-sm text-gray-500 mt-8">
          Dernière mise à jour : {{ new Date().toLocaleDateString('fr-FR') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Mentions Légales',
  description: 'Mentions légales et conditions d\'utilisation du service EasyQuickTrack.',
})
</script>