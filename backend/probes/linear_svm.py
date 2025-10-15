from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix


def train_eval(X, y):
    Xtr, Xte, ytr, yte = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=0)
    clf = LinearSVC()
    clf.fit(Xtr, ytr)
    yhat = clf.predict(Xte)
    return {
        "acc": float(accuracy_score(yte, yhat)),
        "cm": confusion_matrix(yte, yhat).tolist(),
    }

