export type Language = "en" | "es" | "ja"

export type TranslationKeys = {
    common: {
        dashboard: string
        settings: string
        signOut: string
        save: string
        cancel: string
        edit: string
        delete: string
        back: string
        loading: string
        language: string
        currency: string
        active: string
        date: string
        cost: string
        error: string
        success: string
    }
    nav: {
        charging: string
        expenses: string
        analytics: string
    }
    tracker: {
        currentStatus: string
        notCharging: string
        startCharging: string
        stopCharging: string
        sessionActive: string
        startedAt: string
        elapsed: string
        addManual: string
        addExpense: string
        noSessions: string
    }
    history: {
        total: string
        monthlyHistory: string
        chargingHistory: string
        expenseHistory: string
        noData: string
    }
    settings: {
        title: string
        vehicleProfile: string
        vehicleProfileDesc: string
        batteryCapacity: string
        batteryCapacityDesc: string
        homeRate: string
        homeRateDesc: string
        dataManagement: string
        exportData: string
        guestMode: string
        signInToSync: string
    }
    forms: {
        date: string
        time: string
        kwhAdded: string
        startPercent: string
        endPercent: string
        cost: string
        location: string
        notes: string
        type: string
        fast: string
        standard: string
        category: string
        amount: string
        title: string
        odometer: string
    }
    expenseCategories: {
        maintenance: string
        repair: string
        insurance: string
        tax: string
        other: string
    }
}

export const translations: Record<Language, TranslationKeys> = {
    en: {
        common: {
            dashboard: "Dashboard",
            settings: "Settings",
            signOut: "Sign Out",
            save: "Save",
            cancel: "Cancel",
            edit: "Edit",
            delete: "Delete",
            back: "Back",
            loading: "Loading...",
            language: "Language",
            currency: "Currency",
            active: "Active",
            date: "Date",
            cost: "Cost",
            error: "Error",
            success: "Success",
        },
        nav: {
            charging: "Charging",
            expenses: "Expenses",
            analytics: "Analytics",
        },
        tracker: {
            currentStatus: "Current Status",
            notCharging: "Not Charging",
            startCharging: "Start Charging",
            stopCharging: "Stop Charging",
            sessionActive: "Session Active",
            startedAt: "Started at",
            elapsed: "Elapsed",
            addManual: "Add Charge",
            addExpense: "Add Expense",
            noSessions: "No sessions yet",
        },
        history: {
            total: "Total",
            monthlyHistory: "Monthly History",
            chargingHistory: "Charging History",
            expenseHistory: "Expense History",
            noData: "No data available",
        },
        settings: {
            title: "Settings",
            vehicleProfile: "Vehicle Profile",
            vehicleProfileDesc: "Set your car's details for smart calculations",
            batteryCapacity: "Battery Capacity",
            batteryCapacityDesc: "Used to calculate energy added from % change",
            homeRate: "Home Electricity Rate",
            homeRateDesc: "Used to auto-calculate cost for home charging",
            dataManagement: "Data Management",
            exportData: "Export to CSV",
            guestMode: "Guest Mode",
            signInToSync: "Sign in to sync these settings across your devices.",
        },
        forms: {
            date: "Date",
            time: "Time",
            kwhAdded: "kWh Added",
            startPercent: "Start %",
            endPercent: "End %",
            cost: "Cost",
            location: "Location",
            notes: "Notes",
            type: "Type",
            fast: "Fast",
            standard: "Standard",
            category: "Category",
            amount: "Amount",
            title: "Title",
            odometer: "Odometer",
        },
        expenseCategories: {
            maintenance: "Maintenance",
            repair: "Repair",
            insurance: "Insurance",
            tax: "Tax",
            other: "Other",
        },
    },
    es: {
        common: {
            dashboard: "Panel",
            settings: "Ajustes",
            signOut: "Cerrar Sesión",
            save: "Guardar",
            cancel: "Cancelar",
            edit: "Editar",
            delete: "Eliminar",
            back: "Atrás",
            loading: "Cargando...",
            language: "Idioma",
            currency: "Moneda",
            active: "Activo",
            date: "Fecha",
            cost: "Costo",
            error: "Error",
            success: "Éxito",
        },
        nav: {
            charging: "Carga",
            expenses: "Gastos",
            analytics: "Analítica",
        },
        tracker: {
            currentStatus: "Estado Actual",
            notCharging: "No Cargando",
            startCharging: "Iniciar Carga",
            stopCharging: "Detener Carga",
            sessionActive: "Sesión Activa",
            startedAt: "Iniciado a las",
            elapsed: "Transcurrido",
            addManual: "Añadir Carga",
            addExpense: "Añadir Gasto",
            noSessions: "Sin sesiones aún",
        },
        history: {
            total: "Total",
            monthlyHistory: "Historial Mensual",
            chargingHistory: "Historial de Carga",
            expenseHistory: "Historial de Gastos",
            noData: "No hay datos disponibles",
        },
        settings: {
            title: "Ajustes",
            vehicleProfile: "Perfil del Vehículo",
            vehicleProfileDesc: "Configura detalles para cálculos inteligentes",
            batteryCapacity: "Capacidad de Batería",
            batteryCapacityDesc: "Usado para calcular energía añadida desde %",
            homeRate: "Tarifa Eléctrica Hogar",
            homeRateDesc: "Usado para auto-calcular costo de carga en casa",
            dataManagement: "Gestión de Datos",
            exportData: "Exportar a CSV",
            guestMode: "Modo Invitado",
            signInToSync: "Inicia sesión para sincronizar estos ajustes.",
        },
        forms: {
            date: "Fecha",
            time: "Hora",
            kwhAdded: "kWh Añadidos",
            startPercent: "% Inicio",
            endPercent: "% Fin",
            cost: "Costo",
            location: "Ubicación",
            notes: "Notas",
            type: "Tipo",
            fast: "Rápida",
            standard: "Estándar",
            category: "Categoría",
            amount: "Monto",
            title: "Título",
            odometer: "Odómetro",
        },
        expenseCategories: {
            maintenance: "Mantenimiento",
            repair: "Reparación",
            insurance: "Seguro",
            tax: "Impuesto",
            other: "Otro",
        },
    },
    ja: {
        common: {
            dashboard: "ダッシュボード",
            settings: "設定",
            signOut: "ログアウト",
            save: "保存",
            cancel: "キャンセル",
            edit: "編集",
            delete: "削除",
            back: "戻る",
            loading: "読み込み中...",
            language: "言語",
            currency: "通貨",
            active: "アクティブ",
            date: "日付",
            cost: "費用",
            error: "エラー",
            success: "成功",
        },
        nav: {
            charging: "充電",
            expenses: "経費",
            analytics: "分析",
        },
        tracker: {
            currentStatus: "現在の状態",
            notCharging: "充電していません",
            startCharging: "充電開始",
            stopCharging: "充電停止",
            sessionActive: "セッション中",
            startedAt: "開始時刻",
            elapsed: "経過時間",
            addManual: "充電記録を追加",
            addExpense: "経費を追加",
            noSessions: "セッションはまだありません",
        },
        history: {
            total: "合計",
            monthlyHistory: "月次履歴",
            chargingHistory: "充電履歴",
            expenseHistory: "経費履歴",
            noData: "データがありません",
        },
        settings: {
            title: "設定",
            vehicleProfile: "車両プロファイル",
            vehicleProfileDesc: "計算のために車両の詳細を設定します",
            batteryCapacity: "バッテリー容量",
            batteryCapacityDesc: "％変化から充電量を計算するために使用",
            homeRate: "自宅電気料金",
            homeRateDesc: "自宅充電のコストを自動計算するために使用",
            dataManagement: "データ管理",
            exportData: "CSVエクスポート",
            guestMode: "ゲストモード",
            signInToSync: "設定を同期するにはログインしてください。",
        },
        forms: {
            date: "日付",
            time: "時間",
            kwhAdded: "充電量 (kWh)",
            startPercent: "開始 %",
            endPercent: "終了 %",
            cost: "費用",
            location: "場所",
            notes: "メモ",
            type: "タイプ",
            fast: "急速",
            standard: "普通",
            category: "カテゴリー",
            amount: "金額",
            title: "タイトル",
            odometer: "オドメーター",
        },
        expenseCategories: {
            maintenance: "メンテナンス",
            repair: "修理",
            insurance: "保険",
            tax: "税金",
            other: "その他",
        },
    },
}
